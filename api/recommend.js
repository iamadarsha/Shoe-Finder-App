import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key is missing" });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  try {
    const userProfile = req.body;
    
    // Calculate strict upper limit (Budget + 40%)
    const userBudget = userProfile.budget || 5000;
    const maxPrice = Math.round(userBudget * 1.4); 

    const systemPrompt = `
      You are an expert Running Shoe Consultant for India (2025 Context).
      
      USER BUDGET: ₹${userBudget}
      STRICT PRICE CEILING: ₹${maxPrice} (Do NOT recommend shoes above this price).
      
      YOUR TASK:
      Analyze the user profile and return a JSON array of 5 running shoes available in India.
      
      CRITICAL RULES:
      1. **Strict Pricing:** - Only suggest shoes between ₹2000 and ₹${maxPrice}.
         - If the user needs a "Carbon Plated Racer" but budget is ₹3500, RETURN AN EMPTY ARRAY []. Do not suggest a cheap daily trainer as a racer.
         - If no quality shoes exist in this specific price range for their specific goal, return [].
         
      2. **Indian Availability & Links:** - Shoes must be available on Amazon.in, Flipkart, Myntra, Tata Cliq, or Official Brand India sites.
         - Provide a "purchase_link" field. Use a search query format if a direct link is risky: "https://www.amazon.in/s?k=Nike+Pegasus+40" or "https://www.google.com/search?q=buy+Nike+Pegasus+40+India".
      
      3. **New Releases (2024-2025):**
         - Prioritize: Nike Pegasus 41, Vomero 17/18, Asics Novablast 4/5, Puma Velocity Nitro 3, Adidas SL 2.
         
      OUTPUT FORMAT:
      Return a JSON array of objects. If no shoes fit, return [].
      
      JSON Structure:
      [
        {
          "rank": 1,
          "name": "Full Shoe Name",
          "price_current": Number (Raw Integer, e.g. 4500),
          "match_percentage": Number,
          "ratings": { "cushion": Number, "durability": Number, "energy_return": Number },
          "why_it_fits": "Specific reason...",
          "brand": "Brand Name",
          "purchase_link": "URL_STRING",
          "retailer_name": "Amazon.in / Flipkart / Official Site"
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
