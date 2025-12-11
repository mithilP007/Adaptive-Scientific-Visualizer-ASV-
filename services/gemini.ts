import { GoogleGenAI } from "@google/genai";
import { ASV_SYSTEM_INSTRUCTION } from "../constants";
import { VisualizationResult } from "../types";

const parseResponse = (text: string): VisualizationResult => {
  const codeRegex = /```html\s*([\s\S]*?)\s*```/i;
  const match = text.match(codeRegex);

  let code = "";
  let summary = text;
  let hardwareBOM = "";

  if (match && match[1]) {
    code = match[1];
    
    // Split text based on the code block location
    const codeIndex = match.index!;
    const codeLength = match[0].length;
    
    // Everything before code is summary
    summary = text.substring(0, codeIndex).trim();
    
    // Everything after code is BOM (Section 3)
    hardwareBOM = text.substring(codeIndex + codeLength).trim();
  } else {
    // Fallback: try to find <!DOCTYPE html> if markdown blocks are missing
    const htmlStart = text.indexOf("<!DOCTYPE html>");
    if (htmlStart !== -1) {
      code = text.substring(htmlStart);
      summary = text.substring(0, htmlStart).trim();
    }
  }

  // Clean up summary markdown headers
  summary = summary.replace(/Section 1: Summary and Explanation/i, "").trim();
  
  // Clean up BOM markdown headers
  if (hardwareBOM) {
      hardwareBOM = hardwareBOM.replace(/Section 3: Hardware Bill of Materials \(BOM\)/i, "").trim();
      // If it just says N/A, clear it to avoid showing empty tab content
      if (hardwareBOM.match(/^N\/A\.?$/i)) {
          hardwareBOM = "";
      }
  }
  
  return {
    summary,
    code,
    hardwareBOM,
  };
};

export const generateVisualization = async (
  prompt: string,
  images: { base64: string; mimeType: string }[],
  complexity: string = "Intermediate",
  validationMode: boolean = false
): Promise<VisualizationResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare contents
  const parts: any[] = [];
  
  // Add images first
  images.forEach((img) => {
    parts.push({
      inlineData: {
        mimeType: img.mimeType,
        data: img.base64,
      },
    });
  });

  // Construct enriched prompt based on features
  let enrichedPrompt = `Target Audience/Complexity Level: ${complexity}.\n\n`;

  if (validationMode) {
    enrichedPrompt += `MODE: EXPERIMENT ERROR DETECTOR (MULTIMODAL VALIDATION). 
    1. Cross-reference the uploaded image(s) against the textual description/procedure. 
    2. Identify any discrepancies, safety violations, or setup errors. 
    3. In the Summary section, YOU MUST explicitly include a "## ⚠️ VALIDATION ALERT" section detailing these errors if found.
    4. Then, generate the interactive visualization of the CORRECTED procedure.\n\n`;
  }

  enrichedPrompt += `User Request: ${prompt}`;

  // Add text prompt
  parts.push({
    text: enrichedPrompt,
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Best for complex reasoning and code generation
      contents: {
        role: "user",
        parts: parts,
      },
      config: {
        systemInstruction: ASV_SYSTEM_INSTRUCTION,
        temperature: 0.4, // Lower temperature for more consistent code
        maxOutputTokens: 8192,
        thinkingConfig: { thinkingBudget: 1024 } // Enable thinking for better code planning
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("No content generated.");
    }
    return parseResponse(text);

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const transformCode = async (
  sourceCode: string,
  targetFormat: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are an expert code converter. 
    Transform the logic of the following HTML/JS scientific visualization into a ${targetFormat} script.
    
    Rules:
    1. If converting to Python (Matplotlib/NumPy), ensure it creates a static or animated plot that represents the same scientific concept.
    2. If converting to Jupyter Notebook, provide the JSON content for a .ipynb file.
    3. Keep the scientific formulas and logic intact.
    4. Return ONLY the code, no markdown fencing if possible, or inside a single code block.
    
    Source Code:
    ${sourceCode}
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
    });
    
    let text = response.text || "";
    // Strip markdown formatting if present
    text = text.replace(/```[a-z]*\n/gi, "").replace(/```$/g, "");
    return text.trim();
  } catch (error) {
    console.error("Export Error:", error);
    throw error;
  }
};
