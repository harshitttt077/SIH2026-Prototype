// backend/services/ocr_service.js
// ============================================================
// OCR Pipeline — Multi-Tier Deterministic Compliance Vision
// Tier 1: Google Gemini Vision (gemini-flash-latest / lite cascade)
// Tier 2: NVIDIA NIM Vision (meta/llama-3.2-11b-vision-instruct)
// Tier 3: Local Offline Tesseract OCR (Zero API key safety net)
// SIH26034 — Legal Metrology Compliance Checker
// ============================================================

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const Tesseract = require('tesseract.js');
const { extractFields } = require('./extraction_service');

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const MAX_DIMENSION_PX = 1400; // Resize to max 1400px on longest edge for optimal AI vision latency
const GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-flash-lite-latest', 'gemini-3.6-flash'];

// ─── STEP 1: IMAGE VALIDATION & PREPROCESSING ────────────────────────────────
async function validateResolution(imagePath) {
  try {
    const meta = await sharp(imagePath).metadata();
    return { width: meta.width || 800, height: meta.height || 800 };
  } catch (err) {
    console.warn('[OCR] Warning reading dimensions:', err.message);
    return { width: 800, height: 800 };
  }
}

async function preprocessImage(imagePath) {
  const dir = path.dirname(imagePath);
  const ext = path.extname(imagePath).toLowerCase() || '.jpg';
  const base = path.basename(imagePath, ext);
  const processedPath = path.join(dir, `${base}_ocr_ready_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`);

  const meta = await sharp(imagePath).metadata().catch(() => ({ width: 800, height: 800 }));
  const longest = Math.max(meta.width || 0, meta.height || 0);

  let pipeline = sharp(imagePath).rotate();

  if (longest > MAX_DIMENSION_PX) {
    pipeline = pipeline.resize(MAX_DIMENSION_PX, MAX_DIMENSION_PX, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  } else if (longest < 400 && longest > 0) {
    pipeline = pipeline.resize(800, 800, { fit: 'inside' });
  }

  // Preserve natural RGB colors for Vision models (critical for veg/non-veg logos and contrast)
  await pipeline.jpeg({ quality: 90 }).toFile(processedPath);
  return processedPath;
}

// ─── JSON SCHEMA PROMPT ───────────────────────────────────────────────────────
const SCHEMA_HINT = JSON.stringify({
  products: [{
    raw_text_transcript: "Literal transcription of all readable text on the package",
    product_name: "string",
    brand_name: "string",
    net_quantity: "string or number",
    net_quantity_unit: "string (e.g. g, ml, kg, l)",
    mrp: "string or number",
    mrp_includes_tax_statement: true,
    mfg_date: "string",
    best_before: "string",
    manufacturer_name: "string",
    manufacturer_address: "string",
    consumer_care_details: "string",
    batch_lot_number: "string",
    fssai_license: "string",
    country_of_origin: "string",
    ingredients: "string",
    veg_nonveg: "veg or non_veg",
    allergens_detected: ["array of strings"]
  }]
}, null, 2);

const STRUCTURED_PROMPT = `You are the core "AI Brain" of a Legal Metrology enforcement system.
You are analyzing one or more images that represent different angles (front, back, sides) of a SINGLE consumer packaged good. Synthesize the text across all angles into ONE single product JSON output.

CRITICAL INSTRUCTIONS:
- You must extract the exact data from the packaging.
- Read carefully and accurately. If a value is missing, use null.
- Provide a literal transcription of all readable text on the package in the 'raw_text_transcript' field.
- Your output MUST strictly be a valid JSON object adhering to this schema:
${SCHEMA_HINT}`;

// ─── TIER 1: GOOGLE GEMINI VISION ─────────────────────────────────────────────
async function runGeminiVision(imagePaths, modelIndex = 0) {
  if (!config.gemini?.enabled || !config.gemini?.apiKey) {
    throw new Error('Gemini API key not configured.');
  }

  const modelName = GEMINI_MODELS[modelIndex] || 'gemini-3.5-flash-lite';
  const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
  const mimeType = 'image/jpeg';

  const parts = [{ text: STRUCTURED_PROMPT }];
  for (const p of paths) {
    const base64Image = fs.readFileSync(p).toString('base64');
    parts.push({ inlineData: { mimeType, data: base64Image } });
  }

  const payload = {
    contents: [{ parts }],
    generationConfig: {
      temperature: 0.0,
      maxOutputTokens: 4096
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.gemini.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini [${modelName}] returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = responseText.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '').trim();

    let structuredData;
    try {
      const jsonMatch = cleaned.match(/[\[\{][\s\S]*[\]\}]/);
      const rawParsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleaned);
      let products = Array.isArray(rawParsed.products) ? rawParsed.products : (Array.isArray(rawParsed) ? rawParsed : [rawParsed]);
      if (!products || products.length === 0) {
        products = [{ product_name: rawParsed.product_name || 'Packaged Commodity', raw_text_transcript: cleaned }];
      }
      structuredData = { products };
    } catch (parseErr) {
      console.warn('[OCR] Gemini JSON parse warning:', parseErr.message);
      // Robust regex salvage if JSON is slightly truncated
      const salvagedName = cleaned.match(/"product_name"\s*:\s*"([^"]+)"/)?.[1] || 'Packaged Commodity';
      const salvagedBrand = cleaned.match(/"brand_name"\s*:\s*"([^"]+)"/)?.[1] || null;
      const salvagedMrp = cleaned.match(/"mrp"\s*:\s*"([^"]+)"/)?.[1] || null;
      const salvagedQty = cleaned.match(/"net_quantity"\s*:\s*"([^"]+)"/)?.[1] || null;
      const salvagedTranscript = cleaned.match(/"raw_text_transcript"\s*:\s*"([^"]+)"/)?.[1] || cleaned;

      structuredData = {
        products: [{
          product_name: salvagedName,
          brand_name: salvagedBrand,
          mrp: salvagedMrp,
          net_quantity: salvagedQty,
          raw_text_transcript: salvagedTranscript
        }]
      };
    }

    const rawText = structuredData.products[0]?.raw_text_transcript || responseText;
    console.log(`[OCR] Gemini API (${modelName}) extraction complete (${rawText.length} chars)`);

    return {
      text: rawText,
      structuredData,
      confidence: 92,
      engine: 'gemini'
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (modelIndex + 1 < GEMINI_MODELS.length) {
      const nextModel = GEMINI_MODELS[modelIndex + 1];
      console.warn(`[OCR] Gemini failed with ${modelName} (${err.message}) - cascading to ${nextModel}...`);
      await new Promise(r => setTimeout(r, 600));
      return runGeminiVision(imagePaths, modelIndex + 1);
    }
    throw err;
  }
}

// ─── TIER 2: NVIDIA NIM VISION ────────────────────────────────────────────────
async function runNvidiaVision(imagePaths) {
  const apiKey = config.nvidia?.apiKey || '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';
  if (!apiKey) {
    throw new Error('NVIDIA API key not configured.');
  }

  const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
  const mimeType = 'image/jpeg';
  const modelName = 'meta/llama-3.2-11b-vision-instruct';

  const contentArray = [
    { type: 'text', text: 'You are an automated Legal Metrology inspection auditor. Output ONLY a valid JSON object conforming strictly to this schema:\n' + SCHEMA_HINT }
  ];

  for (const p of paths) {
    const base64Image = fs.readFileSync(p).toString('base64');
    contentArray.push({
      type: 'image_url',
      image_url: { url: `data:${mimeType};base64,${base64Image}` }
    });
  }

  const payload = {
    model: modelName,
    messages: [
      {
        role: 'system',
        content: 'You are an automated Legal Metrology inspection auditor. You MUST return ONLY a valid JSON object adhering strictly to the schema. Do NOT write any conversational text, markdown code blocks, or greetings.'
      },
      {
        role: 'user',
        content: contentArray
      }
    ],
    max_tokens: 3072,
    temperature: 0.0
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NVIDIA API returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';
    const cleaned = responseText.replace(/```(?:json)?\s*/g, '').replace(/```\s*$/g, '').trim();

    let structuredData;
    try {
      const jsonMatch = cleaned.match(/[\[\{][\s\S]*[\]\}]/);
      const rawParsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleaned);
      let products = Array.isArray(rawParsed.products) ? rawParsed.products : (Array.isArray(rawParsed) ? rawParsed : [rawParsed]);
      if (!products || products.length === 0) {
        products = [{ product_name: rawParsed.product_name || 'Packaged Commodity', raw_text_transcript: cleaned }];
      }
      structuredData = { products };
    } catch (parseErr) {
      console.warn('[OCR] NVIDIA JSON parse warning:', parseErr.message);
      structuredData = { products: [{ product_name: 'Packaged Commodity', raw_text_transcript: cleaned }] };
    }

    const rawText = structuredData.products[0]?.raw_text_transcript || responseText;
    console.log('[OCR] NVIDIA NIM API extraction complete');

    return {
      text: rawText,
      structuredData,
      confidence: 95,
      engine: 'nvidia'
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ─── TIER 3: LOCAL OFFLINE TESSERACT OCR ──────────────────────────────────────
async function runTesseractOffline(imagePaths) {
  console.log('[OCR] Engaging Offline Tesseract OCR Safety Net...');
  const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
  let combinedText = '';
  let avgConfidence = 70;

  for (const p of paths) {
    try {
      const { data: { text, confidence } } = await Tesseract.recognize(p, 'eng');
      combinedText += (text || '') + '\n';
      avgConfidence = confidence || 70;
    } catch (e) {
      console.warn('[OCR] Tesseract single image error:', e.message);
    }
  }

  const cleanText = combinedText.trim();
  const regexExtracted = extractFields(cleanText, null, null);

  const fallbackProduct = {
    ai_summary: `Processed via offline local OCR engine with ${Math.round(avgConfidence)}% optical recognition confidence. Mandatory declarations parsed using statutory regex patterns.`,
    raw_text_transcript: cleanText,
    product_name: regexExtracted.product_name || 'Packaged Commodity (Offline Inspection)',
    brand_name: regexExtracted.brand_name || null,
    net_quantity: regexExtracted.net_quantity || null,
    net_quantity_unit: regexExtracted.net_quantity_unit || 'g',
    mrp: regexExtracted.mrp || null,
    mrp_includes_tax_statement: regexExtracted.mrp_includes_tax_statement ?? true,
    mfg_date: regexExtracted.mfg_date || null,
    best_before: regexExtracted.best_before || null,
    manufacturer_name: regexExtracted.manufacturer_name || null,
    manufacturer_address: regexExtracted.manufacturer_address || null,
    consumer_care_details: regexExtracted.customer_care || null,
    batch_lot_number: regexExtracted.batch_lot_number || null,
    fssai_license: regexExtracted.fssai_license || null,
    country_of_origin: regexExtracted.country_of_origin || 'India',
    ingredients: regexExtracted.ingredients || null,
    veg_nonveg: regexExtracted.veg_nonveg || null
  };

  return {
    text: cleanText,
    engine: 'tesseract',
    confidenceAvg: Math.round(avgConfidence),
    geminiStructuredData: { products: [fallbackProduct] },
    structuredData: { products: [fallbackProduct] },
    _fontMetrics: [],
    _jsonText: JSON.stringify(fallbackProduct)
  };
}

// ─── RESULT FORMATTER ─────────────────────────────────────────────────────────
function formatResult(res) {
  return {
    text: res.structuredData?.products?.[0]?.raw_text_transcript || res.text,
    engine: res.engine,
    confidenceAvg: res.confidence || 85,
    geminiStructuredData: res.structuredData,
    structuredData: res.structuredData,
    _fontMetrics: [],
    _jsonText: res.text
  };
}

// ─── MASTER OCR PIPELINE ──────────────────────────────────────────────────────
async function runOcrPipeline(imagePaths, metadata = {}) {
  let processedPaths = [];
  const metaObj = typeof metadata === 'string' ? { forceEngine: metadata } : (metadata || {});

  try {
    const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
    for (const p of paths) {
      await validateResolution(p);
      processedPaths.push(await preprocessImage(p));
    }

    // Force engine overrides (for debugging / specific engine audits)
    if (metaObj.forceEngine === 'nvidia') {
      const res = await runNvidiaVision(processedPaths);
      return formatResult(res);
    }
    if (metaObj.forceEngine === 'tesseract') {
      return await runTesseractOffline(processedPaths);
    }

    let errors = [];

    // Tier 1: Google Gemini Vision
    if (config.gemini?.enabled && config.gemini?.apiKey) {
      try {
        console.log('[OCR] Tier 1: Querying Google Gemini Vision...');
        const res = await runGeminiVision(processedPaths);
        const hasValidText = res && (
          (res.text && res.text.trim().length > 25) ||
          (res.structuredData?.products?.[0]?.raw_text_transcript?.trim().length > 25) ||
          (res.structuredData?.products?.[0]?.product_name && res.structuredData.products[0].product_name !== 'Packaged Commodity')
        );
        if (hasValidText) {
          return formatResult(res);
        }
        console.warn('[OCR] Tier 1 Gemini returned empty or incomplete text transcript. Cascading to NVIDIA NIM...');
        errors.push('Gemini returned empty or truncated result');
      } catch (geminiErr) {
        console.warn('[OCR] Tier 1 (Gemini) failed:', geminiErr.message);
        errors.push(`Gemini: ${geminiErr.message}`);
      }
    }

    // Tier 2: NVIDIA NIM Vision (meta/llama-3.2-11b-vision-instruct)
    try {
      console.log('[OCR] Tier 2: Querying NVIDIA NIM Vision Fallback...');
      const res = await runNvidiaVision(processedPaths);
      return formatResult(res);
    } catch (nvidiaErr) {
      console.warn('[OCR] Tier 2 (NVIDIA NIM) failed:', nvidiaErr.message);
      errors.push(`NVIDIA: ${nvidiaErr.message}`);
    }

    // Tier 3: Local Offline Tesseract OCR
    try {
      console.log('[OCR] Tier 3: Engaging Offline Tesseract OCR Safety Net...');
      return await runTesseractOffline(processedPaths);
    } catch (tessErr) {
      console.error('[OCR] Tier 3 (Tesseract) failed:', tessErr.message);
      errors.push(`Tesseract: ${tessErr.message}`);
    }

    console.error('[OCR] ALL ENGINES FAILED:', errors.join(' | '));
    return null;
  } catch (fatal) {
    console.error('[OCR] Pipeline fatal error:', fatal.message);
    return null;
  } finally {
    for (const p of processedPaths) {
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch (_) {}
      }
    }
  }
}

module.exports = { runOcrPipeline };
