import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function analyzeMoodAndGenerateQuery(userInput: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `
  Analyze the user's music mood request and generate:
  1. A clean Spotify search query
  2. A creative playlist name (with emoji if appropriate)
  3. A short playlist description
  
  User input: "${userInput}"
  
  Respond in JSON format like this:
  {
    "searchQuery": "string",
    "playlistName": "string",
    "playlistDescription": "string"
  }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response (Gemini sometimes adds markdown ticks)
    const cleanJson = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to analyze mood");
  }
}