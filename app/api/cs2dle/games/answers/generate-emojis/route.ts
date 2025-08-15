import { NextResponse } from 'next/server';
import {
  weaponEmojis,
  rarityEmojis,
  patternEmojis,
  collectionEmojis,
  teamEmojis,
  specialEmojis,
  finishEmojis
} from '@/data/skin-emoji-mappings';

function getPatternFromName(name: string, description: string): string {
  const text = (name + ' ' + description).toLowerCase();
  const patterns = Object.keys(patternEmojis);
  return patterns.find(pattern => text.includes(pattern.toLowerCase())) || 'default';
}

function getCollectionFromName(name: string, description: string): string {
  const text = (name + ' ' + description).toLowerCase();
  const collections = Object.keys(collectionEmojis);
  return collections.find(collection => text.includes(collection.toLowerCase())) || 'default';
}

function getTeamFromName(name: string, description: string): string {
  const text = (name + ' ' + description).toLowerCase();
  if (text.includes('ct') || text.includes('counter') || text.includes('police')) return 'CT';
  if (text.includes('terrorist') || text.includes('t side')) return 'T';
  return 'Any';
}

function getSpecialAttributes(description: string = '', wear: string = ''): string[] {
  const attributes: string[] = [];
  
  // Check for StatTrak or Souvenir
  if (description.toLowerCase().includes('stattrak')) {
    attributes.push('StatTrak™');
  } else if (description.toLowerCase().includes('souvenir')) {
    attributes.push('Souvenir');
  }
  
  // Add wear condition if provided
  if (wear) {
    attributes.push(wear);
  }
  
  return attributes.length > 0 ? attributes : ['default'];
}

export async function POST(request: Request) {
  try {
    const {
      skinName,
      weaponType,
      description,
      pattern,
      rarity,
      team,
      wear,
      collection,
      finish
    } = await request.json();

    // Get weapon-specific emoji
    const weaponEmoji = weaponEmojis[weaponType]?.[0] || weaponEmojis.default[0];

    // Get rarity-specific emoji
    const rarityEmoji = rarityEmojis[rarity]?.[0] || rarityEmojis.default[0];

    // Get pattern-specific emoji
    const detectedPattern = pattern || getPatternFromName(skinName, description);
    const patternEmoji = patternEmojis[detectedPattern]?.[0] || patternEmojis.default[0];

    // Get collection-specific emoji
    const detectedCollection = collection || getCollectionFromName(skinName, description);
    const collectionEmoji = collectionEmojis[detectedCollection]?.[0] || collectionEmojis.default[0];

    // Get team-specific emoji
    const detectedTeam = team || getTeamFromName(skinName, description);
    const teamEmoji = teamEmojis[detectedTeam]?.[0] || teamEmojis.default[0];

    // Get special attributes emoji
    const specialAttributes = getSpecialAttributes(description, wear);
    const specialEmoji = specialAttributes.map(attr => specialEmojis[attr]?.[0] || specialEmojis.default[0])[0];

    // Get finish style emoji
    const finishEmoji = finish ? finishEmojis[finish]?.[0] || finishEmojis.default[0] : finishEmojis.default[0];

    const emojis = [
      weaponEmoji,
      rarityEmoji,
      patternEmoji,
      teamEmoji,
      specialEmoji
    ];

    // Create detailed descriptions for each emoji
    const getDetailedDescription = (value: string) => {
      // Convert values like "AK-47" to "AK-47"
      // Handle undefined or object cases
      if (!value || typeof value === 'object') return 'Unknown';
      return value.toString();
    };

    const explanations = [
      `${weaponEmoji} - Represents the weapon type: ${getDetailedDescription(weaponType)}`,
      `${rarityEmoji} - Indicates the skin rarity: ${getDetailedDescription(rarity)}`,
      `${patternEmoji} - Represents the skin pattern/theme: ${getDetailedDescription(detectedPattern)}`,
      `${teamEmoji} - Shows the team association: ${getDetailedDescription(detectedTeam)}`,
      `${specialEmoji} - Special attributes: ${specialAttributes.map(attr => getDetailedDescription(attr)).join(', ')}`
    ];

    // Generate hint sentences for each emoji
    const generateHintSentence = (emoji: string, index: number) => {
      const hints = [
        `This emoji represents the weapon type - think about what weapon this skin belongs to`,
        `This emoji indicates the rarity level - consider how valuable this skin is`,
        `This emoji represents the skin's theme or pattern - look at the visual design`,
        `This emoji shows team association - think about which team would use this`,
        `This emoji represents special features - consider unique attributes of this skin`
      ];
      
      // Create more specific hints based on the emoji and skin properties
      const specificHints = [
        `Look for a weapon-related symbol that matches the skin's weapon type`,
        `Find the rarity indicator that shows how valuable this skin is`,
        `Identify the pattern or theme that makes this skin unique`,
        `Consider which team (CT or T) this skin is designed for`,
        `Notice any special features like StatTrak or Souvenir that this emoji represents`
      ];
      
      return specificHints[index] || hints[index] || `This emoji relates to the skin's ${['weapon', 'rarity', 'pattern', 'team', 'features'][index] || 'characteristics'}`;
    };

    const hints = emojis.map((emoji, index) => 
      generateHintSentence(emoji, index)
    );

    const additionalDescriptions = {
      collection: `${collectionEmoji} - From the ${getDetailedDescription(detectedCollection)} collection`,
      finish: `${finishEmoji} - ${getDetailedDescription(finish || 'Default')} finish style`
    };

    return NextResponse.json({
      emojis,
      explanations,
      hints,
      additionalEmojis: additionalDescriptions
    });
  } catch (error) {
    console.error('Error generating emojis:', error);
    return NextResponse.json(
      {
        emojis: ['🔫', '✨', '⭐', '🎨', '🎯'],
        explanations: [
          '🔫 - Default weapon indicator (Generic Weapon)',
          '✨ - Default rarity indicator (Standard)',
          '⭐ - Default pattern indicator (Basic Pattern)',
          '🎨 - Default team indicator (Any Team)',
          '🎯 - Default special attribute (Standard Quality)'
        ],
        hints: [
          'Look for a weapon-related symbol that matches the skin\'s weapon type',
          'Find the rarity indicator that shows how valuable this skin is',
          'Identify the pattern or theme that makes this skin unique',
          'Consider which team (CT or T) this skin is designed for',
          'Notice any special features like StatTrak or Souvenir that this emoji represents'
        ],
        additionalEmojis: {
          collection: '🎮 - From the Default collection',
          finish: '✨ - Default finish style'
        }
      },
      { status: 200 }
    );
  }
} 