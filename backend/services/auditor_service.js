const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

async function generateAIAuditorAnalysis(fieldsMap, violations, rawText) {
  if (!config.gemini?.enabled || !config.gemini?.apiKey) {
    console.warn("[Auditor] No Gemini key found.");
    return null; 
  }
  
  try {
    const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    const prompt = `You are an expert Legal Metrology Compliance Auditor in India. 
You are reviewing a product label for compliance with the Legal Metrology (Packaged Commodities) Rules, 2011.

Here is the extracted data from the label:
${JSON.stringify(fieldsMap, null, 2)}

Here are the violations flagged by our deterministic rules engine:
${JSON.stringify(violations.map(v => ({ rule: v.ruleId, status: v.status, detail: v.detail })), null, 2)}

Write a professional, concise 2-paragraph compliance verdict. 
In paragraph 1, summarize the overall state of the label and the most critical missing mandatory declarations (e.g. MRP, Net Quantity). 
In paragraph 2, cite the specific Legal Metrology rules (e.g. Rule 6, Rule 32) and explain the potential legal consequences for the manufacturer/importer if this is not rectified. 

Do NOT output markdown headers, just return plain text paragraphs separated by a double newline. Be authoritative, precise, and act like a senior legal auditor.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.trim() || null;
  } catch (err) {
    console.warn("[Auditor] LLM generation failed:", err.message);
    return null;
  }
}

module.exports = { generateAIAuditorAnalysis };
