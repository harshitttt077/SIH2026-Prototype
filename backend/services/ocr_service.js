// backend/services/ocr_service.js
// ============================================================
// OCR Pipeline — Spec 04 Implementation
// Step 1: Validate & Preprocess
// Step 2: Tesseract OCR (primary, fully offline, zero cost)
// Step 3: Gemini Vision fallback (only when Tesseract fails)
// Step 4: Graceful error handling for live demo safety
// SIH26034 — Legal Metrology Compliance Checker
// ============================================================


const sharp = require('sharp');

const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { z } = require('zod');

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const MAX_DIMENSION_PX = 1400;         // Resize to max 1400px on longest edge for OCR accuracy
const MIN_DIMENSION_PX = 600;           // Spec: reject below 600px shortest edge
const MIN_OCR_TEXT_LENGTH = 20;         // Below this = "no readable text"
const OCR_CONFIDENCE_THRESHOLD = config.ocr?.confidenceThreshold ?? 50; // % below which Gemini kicks in
        // 45s timeout for Gemini API call
const GEMINI_RETRY_ONCE = true;

// ─── STEP 1: IMAGE VALIDATION & PREPROCESSING ────────────────────────────────

/**
 * Validate image meets minimum resolution requirement (spec 04).
 * Throws clear, user-facing error if too low-res.
 *
 * @param {string} imagePath
 * @throws {Error} "IMAGE_TOO_LOW_RES" if shortest edge < MIN_DIMENSION_PX
 */
async function validateResolution(imagePath) {
  const meta = await sharp(imagePath).metadata();
  const { width, height } = meta;

  if (!width || !height) {
    throw Object.assign(
      new Error('Could not read image dimensions — the file may be corrupt.'),
      { code: 'IMAGE_UNREADABLE' }
    );
  }

  const shortest = Math.min(width, height);
  if (shortest < MIN_DIMENSION_PX) {
    throw Object.assign(
      new Error(
        `Image resolution too low (${width}×${height}px, shortest edge ${shortest}px). ` +
        `Please rescan with the camera closer to the label — minimum ${MIN_DIMENSION_PX}px on shortest edge required.`
      ),
      { code: 'IMAGE_TOO_LOW_RES', width, height }
    );
  }

  return { width, height };
}

/**
 * Preprocess image for OCR accuracy (spec 04 Step 1):
 *  - Auto-rotate via EXIF metadata (sharp handles this with .rotate())
 *  - Resize to max 2000px on longest edge (keeps aspect ratio)
 *  - Contrast enhancement (linear stretch + sharpen) for glossy/reflective packaging
 *
 * Returns path to temp preprocessed file. Caller must clean it up.
 *
 * @param {string} imagePath
 * @returns {string} processedPath
 */
async function preprocessImage(imagePath) {
  const dir = path.dirname(imagePath);
  const ext = path.extname(imagePath).toLowerCase() || '.jpg';
  const base = path.basename(imagePath, ext);
  const processedPath = path.join(dir, `${base}_ocr_ready${ext}`);

  const meta = await sharp(imagePath).metadata();
  const longest = Math.max(meta.width || 0, meta.height || 0);

  let pipeline = sharp(imagePath)
    // Auto-rotate based on EXIF orientation (fixes phone photos taken sideways)
    .rotate();

  // Resize: only downscale (don't upscale low-res images — they'd just be blurry)
  if (longest > MAX_DIMENSION_PX) {
    pipeline = pipeline.resize(MAX_DIMENSION_PX, MAX_DIMENSION_PX, {
      fit: 'inside',        // Preserve aspect ratio, fit within 2000×2000
      withoutEnlargement: true,
    });
  }

  // Preprocessing for OCR accuracy:
  pipeline = pipeline
    .grayscale()                       // Remove color noise that confuses OCR
    .normalize()                       // Auto-stretch contrast (normalizes histogram)
    .sharpen({ sigma: 1.2, m1: 1.5 }) // Sharpen text edges
    .linear(1.15, -(128 * 1.15 - 128))
      .jpeg({ quality: 88 }); // High quality — preserve fine text for vision model

  await pipeline.toFile(processedPath);

  const processedMeta = await sharp(processedPath).metadata();
  console.log(`[OCR] Preprocessed: ${meta.width}×${meta.height} → ${processedMeta.width}×${processedMeta.height}px`);

  return processedPath;
}

// ─── STEP 2: TESSERACT OCR (PRIMARY) ─────────────────────────────────────────



// ─── STEP 3: GEMINI VISION FALLBACK ──────────────────────────────────────────

/**
 * Spec 04 Step 3, Tier 2 — Gemini Vision structured extraction.
 *
 * Uses the EXACT prompt from spec file 04 for structured field extraction.
 * This is the fallback for when Tesseract+regex fails (messy/curved/low-contrast labels).
 *
 * Only called when:
 *   a) Tesseract confidence < OCR_CONFIDENCE_THRESHOLD, OR
 *   b) Tesseract text length < MIN_OCR_TEXT_LENGTH
 *
 * Free-tier discipline: called only when needed, not on every scan.
 *
 * @param {string} imagePath
 * @param {number} [attempt=1]
 * @param {string} [modelName='gemini-2.5-flash']
 * @returns {{ text, structuredData, confidence, engine }}
 */
// --- STEP 3: GROQ VISION FALLBACK ---


const SCHEMA_HINT = JSON.stringify({
  products: [{
    ai_summary: "string (A strictly detailed 4-6 sentence executive summary. You MUST explicitly state exactly WHICH rules passed and exactly WHY any rules failed. Do not sugarcoat. Be precise about legal metrology compliance.)",
    raw_text_transcript: "string",
    product_name: "string",
    brand_name: "string",
    net_quantity: "string or number",
    net_quantity_unit: "string (e.g. g, ml)",
    mrp: "string or number",
    mrp_includes_tax_statement: "boolean or string",
    mfg_date: "string",
    best_before: "string",
    manufacturer_name: "string",
    manufacturer_address: "string",
    consumer_care_details: "string",
    batch_lot_number: "string",
    fssai_license: "string",
    country_of_origin: "string",
    ingredients: "string",
    veg_nonveg: "string",
    ingredient_analysis: {
      is_clean_label: "boolean (true if no synthetic chemicals or artificial preservatives)",
      harmful_additives_found: ["array of strings"],
      health_risks: ["array of strings"],
      allergens_detected: ["array of strings"],
      ingredient_dictionary: [{ name: "string", description: "string (1-2 sentence detailed scientific explanation of this ingredient's purpose and safety)" }]
    }
  }]
}, null, 2);

const STRUCTURED_PROMPT = `You are the core "AI Brain" of a Legal Metrology enforcement system.
You are analyzing one or more images that represent different angles (front, back, sides) of a SINGLE consumer packaged good. Synthesize the text across all angles into ONE single product JSON output.

CRITICAL INSTRUCTIONS:
- You must extract the exact data from the packaging.
- Read carefully and accurately. If a value is missing, use null.
- Provide a literal transcription of all readable text on the package in the 'raw_text_transcript' field.
- Your output MUST exactly match this JSON schema:
${SCHEMA_HINT}`;

async function runGeminiVision(imagePaths, attempt = 1, modelName = 'gemini-flash-latest') {
  if (!config.gemini?.enabled || !config.gemini?.apiKey) {
    throw new Error('Gemini API key not configured.');
  }

  const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
  const mimeType = 'image/jpeg';

  let rawText = '';
  let structuredData = {};

  try {
    const parts = [
      { text: STRUCTURED_PROMPT }
    ];
    for (const p of paths) {
      const base64Image = require('fs').readFileSync(p).toString('base64');
      parts.push({ inlineData: { mimeType, data: base64Image } });
    }

    const payload = {
      contents: [{ parts }],
      generationConfig: { temperature: 0.0 }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.gemini.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const cleaned = responseText.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '').trim();

    try {
      const jsonMatch = cleaned.match(/[\[\{][\s\S]*[\]\}]/);
      const rawParsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleaned);
      const toValidate = Array.isArray(rawParsed.products) ? rawParsed : { products: Array.isArray(rawParsed) ? rawParsed : [rawParsed] };
      structuredData = AIResponseSchema.parse(toValidate);
    } catch (parseErr) {
      console.warn('[OCR] JSON parse/Zod validation failed:', parseErr.message);
      throw new Error('AI hallucinated bad JSON schema: ' + parseErr.message);
    }

    rawText = structuredData._raw_text || responseText;
    console.log('[OCR] Gemini API extraction complete');

  } catch (err) {
    if (attempt < 2) {
      const nextModel = modelName === 'gemini-3.6-flash' ? 'gemini-flash-latest' : 'gemini-2.5-flash';
      err.attemptHistory = (err.attemptHistory || '') + `[Attempt ${attempt} ${modelName}: ${err.message}] `;
      console.warn(`[OCR] Gemini failed with ${modelName} (${err.message}) - retrying with ${nextModel}...`);
      await new Promise(r => setTimeout(r, 1000));
      return runGeminiVision(imagePaths, attempt + 1, nextModel).catch(e => { e.message = err.attemptHistory + e.message; throw e; });
    }
    throw err;
  }

  return {
    text: rawText,
    structuredData,
    confidence: 85,
    words: [],
    engine: 'gemini',
    _fontMetrics: null,
  };
}

async function runGroqVision(imagePaths, attempt = 1, modelName = 'llama-3.3-70b-versatile') {
  if (!config.groq?.enabled || !config.groq?.apiKey) {
    throw new Error('Groq API key not configured.');
  }

  const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
  const mimeType = 'image/jpeg';

  const SCHEMA_HINT = JSON.stringify({
  products: [{
    ai_summary: "string (A strictly detailed 4-6 sentence executive summary. You MUST explicitly state exactly WHICH rules passed and exactly WHY any rules failed. Do not sugarcoat. Be precise about legal metrology compliance.)",
    raw_text_transcript: "string",
    product_name: "string",
    brand_name: "string",
    net_quantity: "string or number",
    net_quantity_unit: "string (e.g. g, ml)",
    mrp: "string or number",
    mrp_includes_tax_statement: "boolean or string",
    mfg_date: "string",
    best_before: "string",
    manufacturer_name: "string",
    manufacturer_address: "string",
    packer_name: "string",
    packer_address: "string",
    importer_name: "string",
    importer_address: "string",
    country_of_origin: "string",
    consumer_care_details: "string",
    batch_lot_number: "string",
    fssai_license: "string",
    ingredient_analysis: {
      harmful_additives_found: ["array of strings"],
      health_risks: ["array of strings"],
      allergens_detected: ["array of strings"],
      ingredient_dictionary: [{ name: "string", description: "string (1-2 sentence detailed scientific explanation of this ingredient's purpose and safety)" }]
    }
  }]
}, null, 2);

const STRUCTURED_PROMPT = `You are an expert AI Food Inspector and Legal Metrology Compliance Auditor.
Your task is to analyze this product packaging image and extract EXACT structured data.

CRITICAL INSTRUCTIONS:
- You must extract the exact data from the packaging.
- Read carefully and accurately. If a value is missing, use null.
- Provide a literal transcription of all readable text on the package in the 'raw_text_transcript' field.
- Your output MUST exactly match this JSON schema:
${SCHEMA_HINT}`;

  let rawText = '';
  let structuredData = {};

  try {
    const groq = new Groq({ apiKey: config.groq.apiKey });
    
    const content = [
      { type: "text", text: STRUCTURED_PROMPT }
    ];
    for (const p of paths) {
      const base64Image = require('fs').readFileSync(p).toString('base64');
      content.push({ type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } });
    }

    const completion = await groq.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content }],
      temperature: 0.0,
      max_tokens: 4096,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    const cleaned = responseText.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '').trim();

    try {
      const jsonMatch = cleaned.match(/[\[\{][\s\S]*[\]\}]/);
      const rawParsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleaned);
      const toValidate = Array.isArray(rawParsed.products) ? rawParsed : { products: Array.isArray(rawParsed) ? rawParsed : [rawParsed] };
      structuredData = AIResponseSchema.parse(toValidate);
    } catch (parseErr) {
      console.warn('[OCR] JSON parse/Zod validation failed:', parseErr.message);
      throw new Error('AI hallucinated bad JSON schema: ' + parseErr.message);
    }

    rawText = structuredData._raw_text || responseText;
    console.log('[OCR] Groq API extraction complete');

  } catch (err) {
    if (attempt < 4) {
      const fallbackModels = ['llama-3.3-70b-versatile', 'llama-3.3-70b-versatile', 'llama-3.3-70b-versatile', 'llama-3.3-70b-versatile'];
      const nextModel = fallbackModels[attempt];
      err.attemptHistory = (err.attemptHistory || '') + `[Attempt ${attempt} ${modelName}: ${err.message}] `;
        console.warn(`[OCR] Groq failed with ${modelName} (${err.message}) - retrying with ${nextModel}...`);
      await new Promise(r => setTimeout(r, 2000));
      return runGroqVision(imagePaths, attempt + 1, nextModel).catch(e => { e.message = err.attemptHistory + e.message; throw e; });
    }
    throw err;
  }

  return {
    text: rawText,
    structuredData,
    confidence: 85,
    words: [],
    engine: 'groq',
    _fontMetrics: null,
  };
}

const ProductSchema = z.object({
  ai_summary: z.string().nullable().optional(),
  raw_text_transcript: z.string().nullable().optional(),
  product_name: z.string().nullable().optional(),
  brand_name: z.string().nullable().optional(),
  reasoning_log: z.string().nullable().optional(),
  meta_image_quality: z.string().nullable().optional(),
  visual_readability: z.string().nullable().optional(),
  meta_obstruction: z.string().nullable().optional(),
  meta_quality_reason: z.string().nullable().optional(),
  is_wholesale_or_multipiece_package: z.union([z.boolean(), z.string()]).nullable().optional(),
  manufacturer_name: z.string().nullable().optional(),
  manufacturer_address: z.string().nullable().optional(),
  packer_name: z.string().nullable().optional(),
  packer_address: z.string().nullable().optional(),
  importer_name: z.string().nullable().optional(),
  importer_address: z.string().nullable().optional(),
  country_of_origin: z.string().nullable().optional(),
  common_name: z.string().nullable().optional(),
  net_quantity: z.union([z.string(), z.number()]).nullable().optional(),
  net_quantity_unit: z.string().nullable().optional(),
  mrp: z.union([z.string(), z.number()]).nullable().optional(),
  mrp_includes_tax_statement: z.union([z.boolean(), z.string()]).nullable().optional(),
  mfg_date: z.string().nullable().optional(),
  ingredient_analysis: z.any().nullable().optional(),
  consumer_care_details: z.string().nullable().optional(),}).passthrough();

const AIResponseSchema = z.object({
  products: z.array(ProductSchema).min(1, "Must detect at least one product")
});


// --- STEP 3B: NVIDIA NIM VISION FALLBACK ---
async function runNvidiaVision(imagePaths, attempt = 1, modelName = 'meta/llama-3.2-11b-vision-instruct') {
  if (!config.nvidia?.enabled || !config.nvidia?.apiKey) {
    throw new Error('NVIDIA API key not configured.');
  }

  const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
  const mimeType = 'image/jpeg';
  
  const contentArray = [
    { type: 'text', text: 'You are an automated Legal Metrology inspection auditor. Output ONLY a valid JSON object conforming strictly to this schema. Do NOT include markdown code fences, conversational intro text, or any explanation outside JSON. Start immediately with {\n' + SCHEMA_HINT }
  ];
  
  for (const p of paths) {
    const base64Image = require('fs').readFileSync(p).toString('base64');
    contentArray.push({
      type: 'image_url',
      image_url: { url: 'data:' + mimeType + ';base64,' + base64Image }
    });
  }

  try {
    const payload = {
      model: modelName,
      messages: [
        {
          role: 'system',
          content: 'You are an automated Legal Metrology inspection auditor. You MUST return ONLY a valid JSON object adhering strictly to the schema. Do NOT write any conversational text, greetings, markdown headers, or introductory phrases outside the JSON.'
        },
        {
          role: 'user',
          content: contentArray
        }
      ],
      max_tokens: 2048,
      temperature: 0.0
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + config.nvidia.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error('NVIDIA API returned ' + response.status + ': ' + errText);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';
    
    const cleaned = responseText.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '').trim();

    let structuredData;
    let rawText = '';

    try {
      let rawParsed = null;
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { rawParsed = JSON.parse(jsonMatch[0]); } catch (_) {}
      }
      if (!rawParsed) {
        rawParsed = JSON.parse(cleaned);
      }
      const toValidate = Array.isArray(rawParsed.products) ? rawParsed : { products: Array.isArray(rawParsed) ? rawParsed : [rawParsed] };
      structuredData = AIResponseSchema.parse(toValidate);
    } catch (parseErr) {
      console.warn('[OCR] JSON parse/Zod validation failed (NVIDIA):', parseErr.message);
      throw new Error('AI hallucinated bad JSON schema: ' + parseErr.message);
    }

    rawText = structuredData._raw_text || responseText;
    console.log('[OCR] NVIDIA NIM API extraction complete');

    return {
      text: rawText,
      structuredData,
      confidence: 96,
      engine: 'nvidia'
    };

  } catch (err) {
    if (attempt < 3) {
      err.attemptHistory = (err.attemptHistory || '') + '[Attempt ' + attempt + ' NVIDIA: ' + err.message + '] ';
      console.warn('[OCR] NVIDIA failed (' + err.message + ') - retrying...');
      await new Promise(r => setTimeout(r, 2000));
      return runNvidiaVision(paths, attempt + 1, modelName);
    }
    throw err;
  }
}


async function runOcrPipeline(imagePaths, metadata = {}) {
  let processedPaths = [];
  const metaObj = typeof metadata === 'string' ? { forceEngine: metadata } : (metadata || {});

  try {
    const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
    for (const p of paths) {
      await validateResolution(p);
      processedPaths.push(await preprocessImage(p));
    }
    
    let geminiErrStr = ''; 
    
    if (metaObj.forceEngine === 'nvidia' && config.nvidia?.enabled) {
      console.log("[OCR] FORCING NVIDIA NIM Vision due to metadata flag...");
      const nvidiaResult = await runNvidiaVision(processedPaths, 1, 'meta/llama-3.2-11b-vision-instruct');
      return {
        text: nvidiaResult.structuredData?.products?.[0]?.raw_text_transcript || nvidiaResult.text,
        engine: "nvidia",
        confidenceAvg: nvidiaResult.confidence,
        geminiStructuredData: nvidiaResult.structuredData,
        structuredData: nvidiaResult.structuredData,
        _fontMetrics: [],
        _jsonText: nvidiaResult.text
      };
    }
    
    // 1. Attempt Gemini Flash Latest First (Active quota, extremely fast)
    if (config.gemini?.enabled && config.gemini?.apiKey) {
      console.log("[OCR] Attempting Gemini Flash Latest...");
      try {
        const geminiResult = await runGeminiVision(processedPaths, 1, 'gemini-flash-latest');
        return {
          text: geminiResult.structuredData?.products?.[0]?.raw_text_transcript || geminiResult.text,
          engine: "gemini",
          confidenceAvg: geminiResult.confidence,
          geminiStructuredData: geminiResult.structuredData,
          structuredData: geminiResult.structuredData,
          _fontMetrics: [],
          _jsonText: geminiResult.text
        };
      } catch (geminiErr) {
        console.warn("[OCR] Gemini Flash Latest failed: " + geminiErr.message); 
        geminiErrStr = geminiErr.message;
      }
    }
    
    // 2. Attempt Gemini Flash Lite Fallback
    if (config.gemini?.enabled && config.gemini?.apiKey) {
      console.log("[OCR] Attempting Gemini Flash Lite Fallback...");
      try {
        const geminiResult = await runGeminiVision(processedPaths, 1, 'gemini-flash-lite-latest');
        return {
          text: geminiResult.structuredData?.products?.[0]?.raw_text_transcript || geminiResult.text,
          engine: "gemini",
          confidenceAvg: geminiResult.confidence,
          geminiStructuredData: geminiResult.structuredData,
          structuredData: geminiResult.structuredData,
          _fontMetrics: [],
          _jsonText: geminiResult.text
        };
      } catch (geminiErr2) {
        console.warn("[OCR] Gemini Flash Lite failed: " + geminiErr2.message); 
      }
    }

    // 3. Attempt NVIDIA NIM Fallback (meta/llama-3.2-11b-vision-instruct)
    if (config.nvidia?.enabled && config.nvidia?.apiKey) {
      console.log("[OCR] Attempting NVIDIA NIM Vision Fallback...");
      try {
        const nvidiaResult = await runNvidiaVision(processedPaths, 1, 'meta/llama-3.2-11b-vision-instruct');
        return {
          text: nvidiaResult.structuredData?.products?.[0]?.raw_text_transcript || nvidiaResult.text,
          engine: "nvidia",
          confidenceAvg: nvidiaResult.confidence,
          geminiStructuredData: nvidiaResult.structuredData,
          structuredData: nvidiaResult.structuredData,
          _fontMetrics: [],
          _jsonText: nvidiaResult.text
        };
      } catch (nvidiaErr) {
        console.warn("[OCR] NVIDIA NIM failed: " + nvidiaErr.message); 
      }
    }
    
    // 4. FAIL CLEANLY (User requested removal of backup OCR)
    console.error("[OCR] ALL CLOUD ENGINES FAILED!");
    
    throw new Error("AI Vision Engines unavailable or failed to process the image. " + 
      (geminiErrStr || groqErrStr || "Please check your network and try again."));
  } catch (err) {
    console.error('[OCR] Pipeline Error:', err.message);
    return null;
  } finally {
    for (const p of processedPaths) {
      if (require('fs').existsSync(p)) {
        try { require('fs').unlinkSync(p); } catch (_) {}
      }
    }
  }
}module.exports = { runOcrPipeline };
