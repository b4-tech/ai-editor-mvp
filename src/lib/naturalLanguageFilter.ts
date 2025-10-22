const AI_PHRASES = [
  /In conclusion,?/gi,
  /In summary,?/gi,
  /To sum up,?/gi,
  /It's worth noting that/gi,
  /It is important to note that/gi,
  /It should be noted that/gi,
  /Additionally,?/gi,
  /Furthermore,?/gi,
  /Moreover,?/gi,
  /As an AI/gi,
  /As a language model/gi,
  /I don't have personal/gi,
  /From my perspective/gi,
  /In my opinion/gi,
  /delve into/gi,
  /utilize/gi,
  /leverage/gi,
  /cutting-edge/gi,
  /state-of-the-art/gi,
  /It's important to remember/gi,
  /Keep in mind that/gi,
  /Bear in mind/gi,
  /Please note/gi,
  /In this regard/gi,
  /With that being said/gi,
  /Having said that/gi,
  /That being said/gi,
  /In other words/gi,
  /To put it simply/gi,
  /Simply put/gi,
];

const REPLACEMENTS: Record<string, string> = {
  'utilize': 'use',
  'leverage': 'use',
  'delve into': 'explore',
  'cutting-edge': 'modern',
  'state-of-the-art': 'advanced',
};

export function naturalizeText(text: string): string {
  let processed = text;

  // Remove AI-typical phrases
  AI_PHRASES.forEach(phrase => {
    processed = processed.replace(phrase, '');
  });

  // Replace overly formal words
  Object.entries(REPLACEMENTS).forEach(([formal, casual]) => {
    const regex = new RegExp(`\\b${formal}\\b`, 'gi');
    processed = processed.replace(regex, casual);
  });

  // Clean up double spaces and awkward punctuation
  processed = processed.replace(/\s+/g, ' ');
  processed = processed.replace(/\s+\./g, '.');
  processed = processed.replace(/\s+,/g, ',');
  processed = processed.replace(/,\s*,/g, ',');
  processed = processed.replace(/\.\s*\./g, '.');
  
  // Clean up sentences that start with punctuation after phrase removal
  processed = processed.replace(/\.\s*,/g, '.');
  processed = processed.replace(/([.!?])\s*([a-z])/g, (match, punct, letter) => {
    return `${punct} ${letter.toUpperCase()}`;
  });

  return processed.trim();
}

