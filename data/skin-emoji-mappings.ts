// Weapon Categories and their emojis
export const weaponEmojis: Record<string, string[]> = {
  // Rifles
  'AK-47': ['🔫', '💥'], // Powerful assault rifle
  'M4A4': ['🎯', '🔫'], // Accurate rifle
  'M4A1-S': ['🤫', '🔫'], // Silenced rifle
  'FAMAS': ['🔫', '📱'], // Burst fire capable
  'Galil AR': ['🔫', '⚡'], // Fast-firing rifle
  'AUG': ['🔭', '🔫'], // Scoped rifle
  'SG 553': ['🎯', '🔭'], // Scoped rifle with accuracy
  
  // Sniper Rifles
  'AWP': ['🎯', '🔭'], // Primary sniper
  'SSG 08': ['🏃', '🎯'], // Mobile sniper
  'SCAR-20': ['🔭', '⚡'], // Auto sniper
  'G3SG1': ['🔭', '💨'], // Fast auto sniper

  // SMGs
  'MP9': ['💨', '🔫'], // Fast SMG
  'MAC-10': ['⚡', '🔫'], // Rapid fire SMG
  'MP7': ['💨', '🎯'], // Balanced SMG
  'UMP-45': ['🔫', '💪'], // Powerful SMG
  'P90': ['⚡', '💨'], // High capacity SMG
  'PP-Bizon': ['💫', '⚡'], // High capacity SMG
  'MP5-SD': ['🤫', '💨'], // Silenced SMG

  // Pistols
  'Desert Eagle': ['🦅', '🔫'], // Powerful pistol
  'R8 Revolver': ['🎯', '🔄'], // Revolver
  'USP-S': ['🤫', '🎯'], // Silenced accurate pistol
  'Glock-18': ['🔫', '💨'], // Fast firing pistol
  'P2000': ['🔫', '📊'], // Balanced pistol
  'P250': ['💫', '🔫'], // Economic pistol
  'Five-SeveN': ['⚡', '🔫'], // Rapid fire pistol
  'Tec-9': ['💨', '⚡'], // Fast firing pistol
  'CZ75-Auto': ['⚡', '🔄'], // Automatic pistol
  'Dual Berettas': ['👥', '🔫'], // Dual pistols

  // Shotguns
  'Nova': ['💥', '🎯'], // Accurate shotgun
  'XM1014': ['💥', '⚡'], // Auto shotgun
  'MAG-7': ['💥', '💪'], // Powerful shotgun
  'Sawed-Off': ['💥', '💨'], // Close range shotgun

  // Heavy
  'M249': ['⚡', '💥'], // Light machine gun
  'Negev': ['💫', '⚡'], // High capacity LMG

  // Default
  'default': ['🔫', '🎯']
};

// Rarity levels and their emojis
export const rarityEmojis: Record<string, string[]> = {
  'Consumer Grade': ['⚪', '📦'], // Basic skins
  'Industrial Grade': ['🔧', '🏭'], // Industrial theme
  'Mil-Spec Grade': ['🎖️', '🪖'], // Military grade
  'Restricted': ['💜', '🔒'], // Restricted items
  'Classified': ['💗', '🔏'], // Classified items
  'Covert': ['❤️', '👑'], // Top tier items
  'Contraband': ['⭐', '💎'], // Special rare items
  'default': ['⚪', '📦']
};

// Pattern themes and their emojis
export const patternEmojis: Record<string, string[]> = {
  // Animal Themes
  'Dragon': ['🐉', '🔥'],
  'Snake': ['🐍', '🪱'],
  'Wolf': ['🐺', '🌙'],
  'Tiger': ['🐯', '🐅'],
  'Lion': ['🦁', '👑'],
  'Phoenix': ['🦅', '🔥'],
  'Hydra': ['🐉', '💧'],
  'Panther': ['🐆', '🌑'],
  
  // Combat Themes
  'Skull': ['💀', '☠️'],
  'Warrior': ['⚔️', '🛡️'],
  'Samurai': ['⚔️', '🎭'],
  'Ninja': ['🥷', '⚔️'],
  'Army': ['🪖', '🎖️'],
  'Tactical': ['🎯', '🛡️'],
  
  // Element Themes
  'Fire': ['🔥', '🌋'],
  'Water': ['💧', '🌊'],
  'Lightning': ['⚡', '🌩️'],
  'Ice': ['❄️', '🧊'],
  'Nature': ['🌿', '🍃'],
  'Earth': ['🌍', '⛰️'],
  
  // Cosmic Themes
  'Space': ['🌌', '🌠'],
  'Galaxy': ['🌌', '✨'],
  'Star': ['⭐', '💫'],
  'Moon': ['🌙', '🌑'],
  'Sun': ['☀️', '🌞'],
  
  // Tech Themes
  'Cyber': ['🤖', '💻'],
  'Digital': ['📱', '💾'],
  'Circuit': ['🔌', '💡'],
  'Neon': ['💡', '🌈'],
  
  // Abstract Themes
  'Geometric': ['📐', '🔷'],
  'Abstract': ['🎨', '🔲'],
  'Wave': ['〰️', '🌊'],
  'Fade': ['🌈', '🎨'],
  
  // Cultural Themes
  'Asian': ['🎭', '🏮'],
  'Egyptian': ['🏺', '🐪'],
  'Nordic': ['⚔️', '❄️'],
  'Aztec': ['🏺', '☀️'],
  
  // Sport Themes
  'Sport': ['🎯', '🎪'],
  'Racing': ['🏁', '💨'],
  'Gaming': ['🎮', '🎲'],
  
  // Military Themes
  'Military': ['🎖️', '🪖'],
  'Camo': ['🪖', '🌿'],
  'Special Forces': ['🎖️', '🛡️'],
  
  // Default
  'default': ['✨', '🎨']
};

// Collection themes and their emojis
export const collectionEmojis: Record<string, string[]> = {
  'Ancient': ['🏺', '📜'],
  'Assault': ['💥', '🏃'],
  'Aztec': ['🏺', '🗿'],
  'Baggage': ['✈️', '🧳'],
  'Bank': ['💰', '🏦'],
  'Cache': ['☢️', '🏭'],
  'Canals': ['🚤', '🌊'],
  'Cobblestone': ['🏰', '⚔️'],
  'Control': ['🎮', '🔧'],
  'Dust': ['🏜️', '🌅'],
  'Gods': ['👑', '⚡'],
  'Havoc': ['💥', '🔥'],
  'Inferno': ['🔥', '⛪'],
  'Italy': ['🍕', '🏛️'],
  'Lake': ['🌊', '🏞️'],
  'Militia': ['🪖', '🏠'],
  'Mirage': ['🏜️', '🕌'],
  'Nuke': ['☢️', '🏭'],
  'Office': ['💼', '🏢'],
  'Overpass': ['🌉', '🚇'],
  'Phoenix': ['🦅', '🔥'],
  'Safehouse': ['🏠', '🔒'],
  'Train': ['🚂', '🏭'],
  'Vertigo': ['🏗️', '🌆'],
  'default': ['🎮', '🎯']
};

// Team-specific emojis
export const teamEmojis: Record<string, string[]> = {
  'CT': ['👮', '🛡️'], // Counter-Terrorists
  'T': ['🦹', '💣'], // Terrorists
  'Any': ['⚔️', '🎮'], // Both teams
  'default': ['⚔️', '🎮']
};

// Special attributes
export const specialEmojis: Record<string, string[]> = {
  'StatTrak™': ['📊', '🔢'], // Kill counter
  'Souvenir': ['🏆', '✨'], // Tournament drops
  'Factory New': ['✨', '💎'], // Best condition
  'Minimal Wear': ['🌟', '✨'], // Almost perfect
  'Field-Tested': ['👌', '🔧'], // Average condition
  'Well-Worn': ['📉', '🔨'], // Below average
  'Battle-Scarred': ['💢', '⚔️'], // Worst condition
  'default': ['✨', '📦']
};

// Finish styles
export const finishEmojis: Record<string, string[]> = {
  'Solid': ['🎨', '⬛'],
  'Painted': ['🖌️', '🎨'],
  'Hydrographic': ['💧', '🌊'],
  'Anodized': ['✨', '🔧'],
  'Gunsmith': ['🔧', '⚒️'],
  'Custom Paint': ['🖌️', '🎯'],
  'Airbrushed': ['💨', '🎨'],
  'Chrome': ['✨', '🔍'],
  'default': ['🎨', '✨']
}; 