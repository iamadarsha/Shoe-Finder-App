import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key is missing" });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using Flash-Lite for massive context handling + speed
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  try {
    const userProfile = req.body;
    
    // ============================================================
    // 👟 MASTER SHOE DATABASE (Source of Truth)
    // ============================================================
    // I have pre-filled this with the specific models you requested.
    // You can append more rows from your Excel file here.
    const SHOE_DATABASE = [
      // --- 1. SUPER SHOES & RACERS (₹18k+) ---
      { name: "Nike Alphafly 3", brand: "Nike", price: 22795, type: "Race Day", features: "ZoomX, Air Zoom, Carbon Plate", retailer: "Nike.in / Dawntown / Kicksmachine" },
      { name: "Asics Metaspeed Sky Paris", brand: "Asics", price: 21999, type: "Race Day", features: "FF Turbo+, Carbon Plate, High Cadence", retailer: "Asics.in / Tata Cliq / Hype Fly" },
      { name: "Adidas Adios Pro 3", brand: "Adidas", price: 24999, type: "Race Day", features: "Lightstrike Pro, EnergyRods", retailer: "Adidas.in / VegNonVeg" },
      { name: "Puma Deviate Nitro Elite 3", brand: "Puma", price: 19999, type: "Race Day", features: "Nitro Elite Foam, Carbon Plate", retailer: "Puma.com / Flipkart" },
      { name: "Saucony Endorphin Pro 4", brand: "Saucony", price: 23990, type: "Race Day", features: "PWRRUN HG, Carbon Plate", retailer: "Tata Cliq / Amazon" },
      { name: "Hoka Cielo X1", brand: "Hoka", price: 23999, type: "Race Day", features: "PEBA Foam, Winged Carbon Plate", retailer: "Tata Cliq / Triworld" },
      { name: "New Balance SC Elite v4", brand: "New Balance", price: 22999, type: "Race Day", features: "FuelCell, Carbon Plate", retailer: "New Balance India / Culture Circle" },
      { name: "Nike Vaporfly 3", brand: "Nike", price: 20695, type: "Race Day", features: "ZoomX, Flyplate", retailer: "Nike.in / Dawntown" },

      // --- 2. SUPER TRAINERS (Max Cushion + Speed) ---
      { name: "Asics Superblast 2", brand: "Asics", price: 21999, type: "Super Trainer", features: "FF Turbo+, No Plate, Massive Stack", retailer: "Asics.in / VegNonVeg" },
      { name: "Adidas Prime X 2 Strung", brand: "Adidas", price: 24999, type: "Super Trainer", features: "Illegal Stack Height, 2 Carbon Plates", retailer: "Adidas.in" },
      { name: "New Balance SC Trainer v3", brand: "New Balance", price: 17999, type: "Super Trainer", features: "FuelCell, Carbon Plate", retailer: "New Balance India" },
      { name: "Puma MagMax Nitro", brand: "Puma", price: 17999, type: "Max Cushion", features: "46mm Stack, Nitro Foam", retailer: "Puma.com / Flipkart" },
      { name: "Hoka Skyward X", brand: "Hoka", price: 18999, type: "Super Trainer", features: "PEBA Foam, Carbon Plate, Stable", retailer: "Tata Cliq" },

      // --- 3. DAILY TRAINERS (The Workhorses) ---
      { name: "Nike Pegasus 41", brand: "Nike", price: 11895, type: "Daily", features: "ReactX Foam, Air Zoom", retailer: "Nike.in / Myntra / Amazon" },
      { name: "Asics Novablast 4", brand: "Asics", price: 13999, type: "Daily", features: "FF Blast+ Eco, Trampoline Effect", retailer: "Amazon / Flipkart / Asics" },
      { name: "Puma Velocity Nitro 3", brand: "Puma", price: 10999, type: "Daily", features: "Nitro Foam, Pumagrip", retailer: "Flipkart / Amazon / Puma" },
      { name: "Adidas Adizero SL 2", brand: "Adidas", price: 11999, type: "Daily Speed", features: "Lightstrike Pro Insert, Lightweight", retailer: "Adidas.in / Myntra" },
      { name: "Brooks Ghost 16", brand: "Brooks", price: 15499, type: "Daily", features: "DNA Loft v3, Nitrogen Injected", retailer: "Amazon / Brooks India" },
      { name: "Saucony Ride 17", brand: "Saucony", price: 11990, type: "Daily", features: "PWRRUN+, Resilient Cushion", retailer: "Tata Cliq / Amazon" },
      { name: "Hoka Clifton 9", brand: "Hoka", price: 12999, type: "Daily", features: "Balanced Cushion, Meta-Rocker", retailer: "Tata Cliq / Triworld" },
      { name: "New Balance 1080v13", brand: "New Balance", price: 15999, type: "Daily Soft", features: "Fresh Foam X, Ultra Soft", retailer: "New Balance India" },
      { name: "Reebok Floatride Energy 5", brand: "Reebok", price: 7999, type: "Daily", features: "Floatride Energy Foam", retailer: "Myntra / Reebok.in" },

      // --- 4. MAX CUSHION (Recovery & Comfort) ---
      { name: "Asics Nimbus 26", brand: "Asics", price: 16999, type: "Max Cushion", features: "PureGEL, FF Blast+ Eco", retailer: "Amazon / Asics.in" },
      { name: "Nike Vomero 17", brand: "Nike", price: 14495, type: "Max Cushion", features: "ZoomX + Cushlon", retailer: "Nike.in / Myntra" },
      { name: "Saucony Triumph 22", brand: "Saucony", price: 16299, type: "Max Cushion", features: "PWRRUN PB (PeBa), Plush", retailer: "Tata Cliq" },
      { name: "New Balance Fresh Foam More v5", brand: "New Balance", price: 14999, type: "Max Cushion", features: "Massive Fresh Foam X", retailer: "New Balance India" },
      { name: "Puma Magnify Nitro 2", brand: "Puma", price: 12999, type: "Max Cushion", features: "Full Nitro Midsole", retailer: "Flipkart / Puma" },
      { name: "Brooks Glycerin 21", brand: "Brooks", price: 15499, type: "Max Cushion", features: "DNA Loft v3, Premium", retailer: "Brooks India" },

      // --- 5. SPEED & TEMPO (Plated but not 'Super') ---
      { name: "Puma Deviate Nitro 3", brand: "Puma", price: 15999, type: "Speed", features: "Carbon Plate, Nitro Foam", retailer: "Puma / Flipkart" },
      { name: "Adidas Boston 12", brand: "Adidas", price: 15999, type: "Speed", features: "EnergyRods, Lightstrike Pro", retailer: "Adidas / VegNonVeg" },
      { name: "Asics Magic Speed 4", brand: "Asics", price: 15999, type: "Speed", features: "Carbon Plate, FF Turbo", retailer: "Asics.in" },
      { name: "Saucony Endorphin Speed 4", brand: "Saucony", price: 16990, type: "Speed", features: "Nylon Plate, PWRRUN PB", retailer: "Tata Cliq" },
      { name: "Hoka Mach 6", brand: "Hoka", price: 13999, type: "Speed", features: "Super Critical Foam, No Plate", retailer: "Tata Cliq" },

      // --- 6. INDIAN VALUE KINGS (Xtep / Budget) ---
      { name: "Xtep 160x 5.0 Pro", brand: "Xtep", price: 14999, type: "Race", features: "Carbon Plate, PISA Foam", retailer: "Xtep India" },
      { name: "Xtep 2000km", brand: "Xtep", price: 7999, type: "Daily", features: "Endurance Rubber, Stable", retailer: "Xtep India" },
      { name: "Xtep Reactive Coil", brand: "Xtep", price: 6999, type: "Daily", features: "Soft Cushion", retailer: "Amazon / Xtep" },
      { name: "Saucony Axon 3", brand: "Saucony", price: 6990, type: "Budget Max", features: "High Stack, Rocker", retailer: "Tata Cliq" },
      { name: "Nike Winflo 11", brand: "Nike", price: 8695, type: "Budget Daily", features: "Cushlon 3.0, Full Air Unit", retailer: "Myntra / Nike" },
      { name: "Puma Electrify Nitro 3", brand: "Puma", price: 6999, type: "Budget Daily", features: "Nitro Heel, ProFoam", retailer: "Flipkart" },
      { name: "Asics GT-1000 13", brand: "Asics", price: 8999, type: "Stability", features: "LiteTruss, Gel", retailer: "Amazon" },

      // -------------------------------------------------------------
      // 📝 PASTE YOUR EXTRA EXCEL ROWS BELOW THIS LINE
      // format: { name: "...", brand: "...", price: 1234, type: "...", features: "...", retailer: "..." },
      // -------------------------------------------------------------
    ];

    // ============================================================
    // 🧠 AI SEARCH LOGIC
    // ============================================================
    
    // 1. Budget Calculation (Strict)
    const userBudget = userProfile.budget || 5000;
    let maxPrice;
    
    if (userBudget >= 18000) {
      maxPrice = 100000; // Unlock everything for high rollers
    } else {
      maxPrice = Math.round(userBudget * 1.35); // 35% Buffer
    }

    const minPrice = 2000; // Filter out cheap non-running shoes

    // 2. The Prompt
    const systemPrompt = `
      You are an Expert Running Shoe Algo.
      
      USER PROFILE:
      - Budget: ₹${userBudget}
      - Goal: ${userProfile.goal}
      - Arch: ${userProfile.arch}
      - Weight: ${userProfile.weight}kg
      
      YOUR DATABASE (Source of Truth):
      ${JSON.stringify(SHOE_DATABASE)}

      YOUR MANDATE:
      1. **Filter:** Scan the database. Pick exactly 5 shoes that fit the User Profile.
      2. **Strict Pricing:** Ignore any shoe with price > ₹${maxPrice}.
      3. **Goal Matching:**
         - "Race Day": Prioritize 'Race Day' & 'Speed' types (Carbon Plates).
         - "Beginner/Recovery": Prioritize 'Max Cushion' & 'Daily' types.
      4. **Retailer Awareness:** Note the specific retailer in the "why_it_fits" to help the user.
      
      OUTPUT FORMAT (JSON Only):
      [
        {
          "rank": 1,
          "name": "Exact Name",
          "price": Number,
          "match_percentage": Number,
          "ratings": { "cushion": 1-5, "durability": 1-5, "energy_return": 1-5 },
          "why_it_fits": "Brief expert review mentioning features and which retailer has it.",
          "brand": "Brand",
          "purchase_link": "https://www.google.com/search?q=buy+SHOE_NAME+India",
          "retailer_name": "Retailer from Database"
        }
      ]
    `;

    const result = await model.generateContent([systemPrompt]);
    const response = await result.response;
    let text = response.text();
    
    // Clean JSON
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    
    if (start === -1 || end === -1) return res.status(200).json([]);

    const jsonString = text.substring(start, end + 1);
    const shoes = JSON.parse(jsonString);

    res.status(200).json(shoes);

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fail gracefully with an empty list so the UI handles it
    res.status(200).json([]); 
  }
}
