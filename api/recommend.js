import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key is missing" });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using Flash-Lite for speed, but with a massive context window
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  try {
    const userProfile = req.body;
    
    // 1. INTELLIGENT BUDGETING
    const userBudget = userProfile.budget || 5000;
    
    // FAILSAFE: If budget is High (>= 15k), unlock "Super Shoes" by removing the ceiling.
    // If budget is Low (< 15k), keep the 40% buffer to prevent unaffordable results.
    let maxPrice;
    if (userBudget >= 15000) {
      maxPrice = 60000; // Allow Alphaflys, Metaspeeds, etc.
    } else {
      maxPrice = Math.round(userBudget * 1.4);
    }

    // 2. ULTRA-SPECIFIC INDIAN INVENTORY (2025-2026 Context)
    // This list forces the AI to pick these exact shoes.
    const indianShoeContext = `
      HIGH-END RACE DAY (Carbon Plated / Super Shoes):
      - Nike: Alphafly 3, Vaporfly 3.
      - Asics: Metaspeed Sky Paris, Metaspeed Edge Paris.
      - Adidas: Adios Pro 4, Adios Pro 3.
      - Puma: Deviate Nitro Elite 3.
      - Saucony: Endorphin Pro 4.
      - New Balance: SC Elite v4.
      - Hoka: Cielo X1, Rocket X2.

      MAX CUSHION / DAILY TRAINING (Premium):
      - Asics: Nimbus 27 (often searched as 28), Superblast 2.
      - Puma: MagMax Nitro, Magnify Nitro 2.
      - Nike: Vomero 18 (Premium Plus), Invincible 3.
      - Adidas: Prime X 2 Strung (Illegal cushion).
      - New Balance: Fresh Foam More v5, 1080v14.
      - Brooks: Glycerin Max.

      SPEED / TEMPO (Plated but Cheaper):
      - Puma: Deviate Nitro 3.
      - Adidas: Takumi Sen 10, Boston 12.
      - Asics: Magic Speed 4.
      - Xtep: 160x 5.0 Pro, 160x 6.0.

      DAILY DRIVERS (Reliable):
      - Nike: Pegasus 41/42.
      - Asics: Novablast 5.
      - Puma: Velocity Nitro 3.
      - Adidas: Adizero SL 2.
    `;

    // 3. RETAILER STRATEGY
    // We explicitly tell AI to look at these stores for specific shoe types.
    const retailerPrompt = `
      RETAILER PRIORITY LIST:
      - For Hype/Race Shoes (Alphafly, Metaspeed): Check [Dawntown, Kicksmachine, Hype Fly, Culture Circle, Hype Elixir].
      - For Daily Trainers (Pegasus, Nitro): Check [Amazon.in, Flipkart, Myntra, Tata Cliq, Official Brand Sites].
      - For Niche Performance (Hoka, Brooks, Xtep): Check [Triworld, Xtep India Official, Brooks India].
    `;

    const systemPrompt = `
      You are an Elite Running Shoe Analyst (Sole Review / RunTesters Level).
      
      USER BUDGET: ₹${userBudget} (Strict Ceiling: ₹${maxPrice})
      GOAL: ${userProfile.goal}
      
      YOUR MANDATE:
      Select exactly 5 DISTINCT shoes from the "Inventory Context" that perfectly match the user's goal.
      
      CRITICAL LOGIC RULES:
      1. **Race Day Logic:** - If User Goal is "Race Day Speed" or "Marathon Training" AND Budget is > ₹18k:
         - YOU MUST RECOMMEND: Alphafly 3, Metaspeed Sky, Adios Pro 3/4, or Deviate Elite. 
         - Do not suggest daily trainers like Pegasus here.
         
      2. **Max Cushion Logic:**
         - If User Goal is "Beginner" or "Daily Fitness" or Feel is "Plush":
         - YOU MUST RECOMMEND: Nimbus 27/28, MagMax, Vomero 18, or Superblast.
      
      3. **Brand Variety:** - Do NOT output 3 Nike shoes. Mix it up: 1 Asics, 1 Adidas, 1 Puma, 1 Hoka/Xtep.
         
      4. **Price Check:** - If the user has a high budget (20k+), DO NOT show them cheap shoes (under 10k). Show them premium options.
      
      ${indianShoeContext}
      ${retailerPrompt}
         
      OUTPUT FORMAT:
      Return ONLY a JSON array.
      
      [
        {
          "rank": 1,
          "name": "Exact Model Name",
          "price": Number (Integer only),
          "match_percentage": Number (90-99),
          "ratings": { "cushion": 1-5, "durability": 1-5, "energy_return": 1-5 },
          "why_it_fits": "Technical breakdown (foam type, plate, drop). Use reviewer language.",
          "brand": "Brand Name",
          "purchase_link": "https://www.google.com/search?q=buy+SHOE_NAME+India",
          "retailer_name": "Specific Store (e.g. Kicksmachine / Amazon)"
        }
      ]
    `;

    const userMessage = `User Profile: ${JSON.stringify(userProfile)}`;

    const result = await model.generateContent([systemPrompt, userMessage]);
    const response = await result.response;
    let text = response.text();
    
    // Clean JSON
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    
    if (start === -1 || end === -1) return res.status(200).json([]);

    const jsonString = text.substring(start, end + 1);
    let shoes = JSON.parse(jsonString);

    // 4. FINAL SAFETY FILTER
    shoes = shoes.filter(shoe => {
      const price = parseInt(shoe.price);
      // Only filter out if price is absurdly high (above 60k) or clearly bad data
      return !isNaN(price) && price <= maxPrice;
    });

    res.status(200).json(shoes);

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(200).json([]); 
  }
}
