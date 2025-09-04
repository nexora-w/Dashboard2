import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { skinName, skinDescription, weapon, image, rarity, team } = data;

    if (!skinName || !weapon) {
      return NextResponse.json(
        { error: "Missing required fields: skinName and weapon are required" },
        { status: 400 }
      );
    }

    const prompt = `Generate exactly five emojis that will help users guess the Counter-Strike 2 skin with these details:
Weapon: ${weapon}
Skin Name: ${skinName}
${skinDescription ? `Description: ${skinDescription}` : ""}
${image ? `Image: ${image}` : ""}
${team ? `Team: ${team}` : ""}
${rarity ? `Rarity: ${rarity}` : ""}

Your task is to create emojis that serve as visual clues for a skin guessing game. These clues must help players connect visuals, name, and rarity — without using literal words or repeating meanings.

---

🎯 **Emoji Slot Breakdown**
- **Emoji 1:** Match the **first word** of the skin name as directly as possible. Use a literal emoji that visually reflects that word.  
  • If the skin name is a **single compound word that can be logically split into two emoji-friendly concepts**, split it.  
  • In that case, the **first part becomes Emoji 1**, and the **second part becomes Emoji 2**.  
  • Example: “Redline” → 🟥 (Red) + ➖ (Line)

- **Emoji 2:** Match the **second word** of a two-word name, or the **second half of a split word** (see rule above).  
  • This emoji must represent a distinct concept from Emoji 1.  
  • Avoid synonyms, visual overlap, or repeating ideas.

- **Emoji 3:** Hint at the skin’s **visual design, material, or emotional tone** (e.g., ❄️ for icy, ⚙️ for mechanical, 🧠 for cerebral).  
  • Avoid repeating anything already shown in Emoji 1 or 2.

- **Emoji 4:** Rarity. Use **exactly one** of the following emojis to represent the skin’s rarity:
  • ⚪ → "Consumer Grade"  
  • 🔵 → "Industrial Grade"  
  • 🔷 → "Mil-Spec Grade"  
  • 🟣 → "Restricted"  
  • 💟 → "Classified"  
  • 🔴 → "Covert"  
  • 🟠 → "Contraband"  
  • 🟡 → "Special Item"

- **Emoji 5:** Weapon type. Use one of the following emojis to represent the skin’s weapon category:
  • 🔫 → Pistol  
  • 🔭 → Sniper Rifle  
  • 🎯 → Scoped Rifle  
  • 💥 → Assault Rifle  
  • 🔉 → SMG  
  • 🦆 → Shotgun  
  • 🛡️ → LMG

---

💬 **Hint Writing Rules (Per Emoji)**

Return one **short hint per emoji** in **four languages**: English, Dutch, Chinese, Russian.

- **Emoji 1 & 2 (Name-Based Emojis):**
  • Hints should be **casual, visual, and fun**  
  • Light internet slang is allowed if it improves clarity or engagement  
  • Examples:  
    - 🟥 → “Red asf”  
    - 🍇 → “Fruity af”  
    - 🐍 → “Venom vibes”  
  • Avoid forced slang — keep it smooth, not tryhard

- **Emoji 3 (Visual/Texture):**
  • Use metaphor, visual detail, or mood — slang optional  
  • Examples: “Shiny purple glare”, “Neon city vibes”, “Clean af finish”

- **Emoji 4 (Rarity):**
  • Hint must be the **exact rarity label** from this list:  
    - "Consumer Grade"  
    - "Industrial Grade"  
    - "Mil-Spec Grade"  
    - "Restricted"  
    - "Classified"  
    - "Covert"  
    - "Contraband"  
    - "Special Item"

- **Emoji 5 (Weapon Type):**
  • Hint must be the **exact class name** of the weapon from this list:  
    - "Pistol"  
    - "Sniper Rifle"  
    - "Scoped Rifle"  
    - "Assault Rifle"  
    - "SMG"  
    - "Shotgun"  
    - "LMG"  
  • No metaphors, no descriptions — just the class.

---

⚠️ **IMPORTANT:** Use ONLY universally supported emojis that display correctly on ALL operating systems (Windows, macOS, Linux, iOS, Android). Avoid newer or platform-specific emojis.

---

📦 **Return the response in this EXACT JSON format:**
\`\`\`json
{
  "emojis": ["🔥", "🐍", "✨", "🔴", "💥"],
  "hints": {
    "english": ["Dangerous element", "Wild creature", "Shiny surface", "Covert", "Assault Rifle"],
    "dutch": ["Gevaarlijk element", "Wild dier", "Glimmend oppervlak", "Covert", "Aanvalsgeweer"],
    "chinese": ["危险元素", "野生动物", "闪亮表面", "隐秘级", "突击步枪"],
    "russian": ["Опасный элемент", "Дикое существо", "Блестящая поверхность", "Скрытый", "Штурмовая винтовка"]
  }
}
\`\`\`
`;
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseContent = completion.choices[0].message.content;
    let response;

    try {
      // Clean the response content to handle markdown formatting
      let cleanedContent = responseContent || "{}";

      // Remove markdown code blocks if present
      if (cleanedContent.includes("```json")) {
        cleanedContent = cleanedContent
          .replace(/```json\s*/, "")
          .replace(/\s*```/, "");
      } else if (cleanedContent.includes("```")) {
        cleanedContent = cleanedContent
          .replace(/```\s*/, "")
          .replace(/\s*```/, "");
      }

      // Trim whitespace
      cleanedContent = cleanedContent.trim();

      response = JSON.parse(cleanedContent);
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error);
      console.error("Response content:", responseContent);
      // Fallback to default response with multilingual hints
      response = {
        emojis: ["🔥", "⭐", "🎨", "💎", "💥"],
        hints: {
          english: [
            "This emoji represents the skin's main theme",
            "This emoji indicates the rarity level",
            "This emoji shows the visual pattern",
            "This emoji represents special features",
            "This emoji represents the weapon type",
          ],
          dutch: [
            "Dit emoji vertegenwoordigt het hoofdthema van de skin",
            "Dit emoji geeft het zeldzaamheidsniveau aan",
            "Dit emoji toont het visuele patroon",
            "Dit emoji vertegenwoordigt speciale kenmerken",
            "Dit emoji vertegenwoordigt het wapentype",
          ],
          chinese: [
            "这个表情符号代表皮肤的主要主题",
            "这个表情符号表示稀有度等级",
            "这个表情符号显示视觉图案",
            "这个表情符号代表特殊特征",
            "这个表情符号代表武器类型",
          ],
          russian: [
            "Этот эмодзи представляет основную тему скина",
            "Этот эмодзи указывает на уровень редкости",
            "Этот эмодзи показывает визуальный узор",
            "Этот эмодзи представляет особые черты",
            "Этот эмодзи представляет тип оружия",
          ],
        },
      };
    }

    const { emojis = [], hints = {} } = response;

    // Ensure all required languages are present
    const requiredLanguages = [
      "english",
      "dutch",
      "chinese",
      "russian",
    ] as const;
    const defaultHints = {
      english: ["Theme", "Rarity", "Pattern", "Features", "Weapon"],
      dutch: ["Thema", "Zeldzaamheid", "Patroon", "Kenmerken", "Wapen"],
      chinese: ["主题", "稀有度", "图案", "特征", "武器"],
      russian: ["Тема", "Редкость", "Узор", "Особенности", "Оружие"],
    };

    // Fill missing languages with default hints
    requiredLanguages.forEach((lang) => {
      if (!hints[lang] || !Array.isArray(hints[lang])) {
        hints[lang] = defaultHints[lang];
      }
    });

    return NextResponse.json({ emojis, hints });
  } catch (error) {
    console.error("Error generating emojis:", error);
    return NextResponse.json(
      {
        error: "Failed to generate emojis",
        emojis: ["🔥", "⭐", "🎨", "💎", "💥"],
        hints: {
          english: [
            "This emoji represents the skin's main theme",
            "This emoji indicates the rarity level",
            "This emoji shows the visual pattern",
            "This emoji represents special features",
            "This emoji represents the explosive nature of the skin",
          ],
          dutch: [
            "Dit emoji vertegenwoordigt het hoofdthema van de skin",
            "Dit emoji geeft het zeldzaamheidsniveau aan",
            "Dit emoji toont het visuele patroon",
            "Dit emoji vertegenwoordigt speciale kenmerken",
            "Dit emoji vertegenwoordigt de explosieve aard van de skin",
          ],
          chinese: [
            "这个表情符号代表皮肤的主要主题",
            "这个表情符号表示稀有度等级",
            "这个表情符号显示视觉图案",
            "这个表情符号代表特殊特征",
            "这个表情符号代表皮肤的爆炸性质",
          ],
          russian: [
            "Этот эмодзи представляет основную тему скина",
            "Этот эмодзи указывает на уровень редкости",
            "Этот эмодзи показывает визуальный узор",
            "Этот эмодзи представляет особые черты",
            "Этот эмодзи представляет взрывной характер скина",
          ],
        },
      },
      { status: 500 }
    );
  }
}
