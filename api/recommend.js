import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key is missing" });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using the model you selected that supports higher limits
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  try {
    const userProfile = req.body;

    const systemPrompt = `
      You are an expert Running Shoe Consultant for the Indian Market (2025-2026 Context).
      
      YOUR TASK:
      Analyze the user profile and recommend the top 5 running shoes available in India.
      
      CRITICAL RULES:
      1. **Strict Budgeting:** If the user's budget is very low (e.g., under ₹2500) and they ask for high-end features (like "Carbon Plate", "Marathon Racing", or "Super Shoe"), YOU MUST RETURN AN EMPTY ARRAY []. Do not recommend cheap casual shoes as "racing shoes".
      2. **New Releases:** Prioritize 2025 and 2026 models. Look for:
         - Nike Vomero 18, Pegasus 41/42
         - Asics Nimbus 27/28, Novablast 5
         - Adidas Adizero SL 2, Boston 13
         - Puma Velocity Nitro 3, Deviate Nitro 3
         - Xtep 160x series (popular in India)
         - Brooks Ghost 16, Glycerin 21/22
      3. **Indian Availability:** Only suggest shoes purchasable on: Amazon India, Flipkart, Myntra, Tata Cliq, VegNonVeg, Superkicks, or official Indian brand websites (.in).
      4. **Accuracy:** Price must be the current estimated street price in INR.
      
      OUTPUT FORMAT:
      Return a JSON array of objects.
      If no shoes fit the strict criteria (especially budget), return an empty array [].
      
      JSON Structure:
      [
        {
          "rank": 1,
          "name": "Full Shoe Name",
          "price_current": Number (INR),
          "price_original": Number (INR),
          "match_percentage": Number,
          "ratings": { "cushion": Number, "durability": Number, "energy_return": Number },
          "why_it_fits": "Specific reason citing Indian road conditions or humidity.",
          "image_keyword": "Shoe Name side profile"
        }
      ]
      
      Do not use markdown. Just raw JSON.
    `;

    const userMessage = `User Profile: ${JSON.stringify(userProfile)}`;

    const result = await model.generateContent([systemPrompt, userMessage]);
    const response = await result.response;
    let text = response.text();
    
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const shoes = JSON.parse(text);
    res.status(200).json(shoes);

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate recommendations", details: error.message });
  }
}
