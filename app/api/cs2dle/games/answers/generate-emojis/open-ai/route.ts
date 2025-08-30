import { NextResponse } from 'next/server';
import OpenAI from 'openai';

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
        { error: 'Missing required fields: skinName and weapon are required' },
        { status: 400 }
      );
    }

    const prompt = `Generate exactly five emojis that will help users guess the Counter-Strike 2 skin with these details:
                    Weapon: ${weapon}
                    Skin Name: ${skinName}
                    ${skinDescription ? `Description: ${skinDescription}` : ''}
                    ${image ? `Image: ${image}` : ''}
                    ${team ? `Team: ${team}` : ''}
                    ${rarity ? `Rarity: ${rarity}` : ''}
                    
                    Your task is to create emojis that serve as visual clues for a skin guessing game. Choose emojis that are:
                    1. Directly related to the skin's name, description, or visual characteristics  
                    2. Visually distinctive and easy to remember  
                    3. Helpful for identifying the specific skin  
                    4. Not too similar to each other  
                    5. Reflective of the skin's rarity and weapon type  
                    6. Understandable and readable for players  

                    Emoji Selection Strategy:
                    - Emoji 1: Primary theme from the skin name  
                    - Emoji 2: Secondary theme from skin name. If theme from name not possible use pattern, or related element from the skin name.  
                        • If the skin name contains two words (e.g., "Fire Serpent"), use one emoji for each word (e.g., "Fire" → 🔥, "Serpent" → 🐍)  
                        • If the skin name is a single word that can logically be split into two parts (e.g., "Redline" → "Red" + "Line"), use emojis that reflect both parts (e.g., 🟥 and ➖)  
                    - Emoji 3: A visual or material clue that reflects how the skin looks, what it's made of, or what the description implies.  Avoid repeating anything already shown in Emoji 1 or 2.
                    Use this emoji to hint at the texture, material, or construction style — or a key detail from the skin's in-game description.

                    Emoji 4: Rarity/Category indicator, based on in-game color coding. The emoji should represent the color of the rarity, and the hint should clearly state the rarity name. No metaphors or abstract phrases allowed here — only the direct name of the rarity.
                    • Consumer Grade (light gray) → ⚪ → Hint: "Consumer Grade"
                    • Industrial Grade (light blue) → 🔵 → Hint: "Industrial Grade"
                    • Mil-Spec Grade (medium blue) → 🔷 → Hint: "Mil-Spec Grade"
                    • Restricted (purple) → 🟣 → Hint: "Restricted"
                    • Classified (pink) → 💟 → Hint: "Classified"
                    • Covert (red) → 🔴 → Hint: "Covert"
                    • Contraband (orange/yellow) → 🟠 → Hint: "Contraband"
                    • Special items (knives/gloves – gold) → 🟡 → Hint: "Special Item"
                    - Emoji 5: Weapon type indicator:
                      • Sniper rifles (AWP, SSG 08, SCAR-20, G3SG1) → 🔭  
                      • Scoped rifles (AUG, SG 553) → 🎯  
                      • Assault rifles (AK-47, M4A4, M4A1-S, FAMAS, Galil AR) → 💥  
                      • Pistols (Glock-18, USP-S, P2000, P250, CZ75-Auto, Five-SeveN, Tec-9, Dual Berettas, Desert Eagle, R8 Revolver) → 🔫  
                      • SMGs (MP9, MP7, MP5-SD, MAC-10, UMP-45, P90, PP-Bizon) → 🔉  
                      • Shotguns (Nova, XM1014, MAG-7, Sawed-Off) → 🦆  
                      • LMGs (M249, Negev) → 🛡️  

                    HINTS:  
                    For each emoji, provide hints in FOUR languages: English, Dutch, Chinese, and Russian.
                    
                    - Emoji 1-3, 5: Use **indirect** hints **without using any words from the skin name, description, or weapon name**. Use abstract ideas, metaphors, emotional tone, visual impressions, or color associations. Avoid literal terms or direct mentions.
                    - Emoji 4: Use the **exact rarity name** as specified in the mapping above (e.g., "Consumer Grade", "Industrial Grade", "Mil-Spec", etc.). This is the only emoji that should use direct, literal terms.
                       
                    
                    IMPORTANT: Use ONLY universally supported emojis that display correctly on ALL operating systems (Windows, macOS, Linux, iOS, Android). Avoid newer or platform-specific emojis.
                    Return the response in this **exact JSON format**:
                    {
                      "emojis": ["🔥", "🐍", "✨", "🔴", "💥"],
                      "hints": {
                        "english": ["Dangerous element", "Wild creature", "Shiny surface", "Covert", "High-impact weapon"],
                        "dutch": ["Gevaarlijk element", "Wild dier", "Glimmend oppervlak", "Covert", "Hoog-impact wapen"],
                        "chinese": ["危险元素", "野生动物", "闪亮表面", "隐秘级", "高冲击武器"],
                        "russian": ["Опасный элемент", "Дикое существо", "Блестящая поверхность", "Скрытый", "Высокоударное оружие"]
                      }
                    }`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4o',
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseContent = completion.choices[0].message.content;
    let response;
    
    try {
      // Clean the response content to handle markdown formatting
      let cleanedContent = responseContent || '{}';
      
      // Remove markdown code blocks if present
      if (cleanedContent.includes('```json')) {
        cleanedContent = cleanedContent.replace(/```json\s*/, '').replace(/\s*```/, '');
      } else if (cleanedContent.includes('```')) {
        cleanedContent = cleanedContent.replace(/```\s*/, '').replace(/\s*```/, '');
      }
      
      // Trim whitespace
      cleanedContent = cleanedContent.trim();
      
      response = JSON.parse(cleanedContent);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      console.error('Response content:', responseContent);
      // Fallback to default response with multilingual hints
      response = {
        emojis: ['🔥', '⭐', '🎨', '💎', '💥'],
        hints: {
          english: [
            'This emoji represents the skin\'s main theme',
            'This emoji indicates the rarity level',
            'This emoji shows the visual pattern',
            'This emoji represents special features',
            'This emoji represents the weapon type'
          ],
          dutch: [
            'Dit emoji vertegenwoordigt het hoofdthema van de skin',
            'Dit emoji geeft het zeldzaamheidsniveau aan',
            'Dit emoji toont het visuele patroon',
            'Dit emoji vertegenwoordigt speciale kenmerken',
            'Dit emoji vertegenwoordigt het wapentype'
          ],
          chinese: [
            '这个表情符号代表皮肤的主要主题',
            '这个表情符号表示稀有度等级',
            '这个表情符号显示视觉图案',
            '这个表情符号代表特殊特征',
            '这个表情符号代表武器类型'
          ],
          russian: [
            'Этот эмодзи представляет основную тему скина',
            'Этот эмодзи указывает на уровень редкости',
            'Этот эмодзи показывает визуальный узор',
            'Этот эмодзи представляет особые черты',
            'Этот эмодзи представляет тип оружия'
          ]
        }
      };
    }

    const { emojis = [], hints = {} } = response;

    // Ensure all required languages are present
    const requiredLanguages = ['english', 'dutch', 'chinese', 'russian'] as const;
    const defaultHints = {
      english: ['Theme', 'Rarity', 'Pattern', 'Features', 'Weapon'],
      dutch: ['Thema', 'Zeldzaamheid', 'Patroon', 'Kenmerken', 'Wapen'],
      chinese: ['主题', '稀有度', '图案', '特征', '武器'],
      russian: ['Тема', 'Редкость', 'Узор', 'Особенности', 'Оружие']
    };

    // Fill missing languages with default hints
    requiredLanguages.forEach(lang => {
      if (!hints[lang] || !Array.isArray(hints[lang])) {
        hints[lang] = defaultHints[lang];
      }
    });

    return NextResponse.json({ emojis, hints });
  } catch (error) {
    console.error('Error generating emojis:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate emojis',
        emojis: ['🔥', '⭐', '🎨', '💎', '💥'],
        hints: {
          english: [
            'This emoji represents the skin\'s main theme',
            'This emoji indicates the rarity level',
            'This emoji shows the visual pattern',
            'This emoji represents special features',
            'This emoji represents the explosive nature of the skin'
          ],
          dutch: [
            'Dit emoji vertegenwoordigt het hoofdthema van de skin',
            'Dit emoji geeft het zeldzaamheidsniveau aan',
            'Dit emoji toont het visuele patroon',
            'Dit emoji vertegenwoordigt speciale kenmerken',
            'Dit emoji vertegenwoordigt de explosieve aard van de skin'
          ],
          chinese: [
            '这个表情符号代表皮肤的主要主题',
            '这个表情符号表示稀有度等级',
            '这个表情符号显示视觉图案',
            '这个表情符号代表特殊特征',
            '这个表情符号代表皮肤的爆炸性质'
          ],
          russian: [
            'Этот эмодзи представляет основную тему скина',
            'Этот эмодзи указывает на уровень редкости',
            'Этот эмодзи показывает визуальный узор',
            'Этот эмодзи представляет особые черты',
            'Этот эмодзи представляет взрывной характер скина'
          ]
        }
      },
      { status: 500 }
    );
  }
}
