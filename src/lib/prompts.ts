import type { TreatmentSettings, Chapter } from '../types/treatment';

export function buildSystemPrompt(settings: TreatmentSettings): string {
  const { tone, genre, styleEmulation, creativeModes, naturalizeText } = settings;

  let prompt = `You are an expert commercial director and treatment writer. You help directors craft compelling, professional treatments for commercial pitches.

TONE: ${getToneDescription(tone)}
GENRE: ${genre}

${styleEmulation ? `WRITING STYLE TO EMULATE:\n${styleEmulation}\n\n` : ''}

${creativeModes.tighten ? 'CREATIVE MODE: TIGHTEN - Use concise, punchy language. Every word must earn its place.\n' : ''}
${creativeModes.quips ? 'CREATIVE MODE: QUIPS - Inject wit, humor, and memorable one-liners throughout.\n' : ''}
${creativeModes.curveball ? 'CREATIVE MODE: CURVEBALL - Take unexpected angles and surprising approaches.\n' : ''}

GUIDELINES:
- Write in a confident, professional voice that sounds like a real director, not AI
- Be specific and visual in your descriptions
- Avoid clichés, corporate jargon, and AI-typical phrases
- Use active voice and strong verbs
- Make every sentence count
${naturalizeText ? '- Write naturally - NO phrases like "in conclusion," "it\'s worth noting," "additionally," etc.\n' : ''}
- Focus on the creative vision and execution
- Reference the brief and director's vision throughout

${getGenreGuidelines(genre)}`;

  return prompt;
}

function getToneDescription(tone: string): string {
  const tones: Record<string, string> = {
    DIRECT: 'Clear, confident, straightforward. Get to the point. No fluff.',
    CONVERSATIONAL: 'Warm, engaging, like talking to a colleague. Natural and approachable.',
    FUNNY: 'Witty, playful, with clever observations. Make them smile while staying professional.',
    POETIC: 'Evocative, lyrical, painting pictures with words. Elegant and atmospheric.',
  };
  return tones[tone] || tones.CONVERSATIONAL;
}

function getGenreGuidelines(genre: string): string {
  const guidelines: Record<string, string> = {
    CARS: '- Emphasize movement, power, design, and emotion\n- Reference automotive cinematography conventions\n- Consider the relationship between driver and machine',
    TECH: '- Focus on innovation, simplicity, and human benefit\n- Avoid jargon; make complex ideas accessible\n- Show, don\'t just tell',
    SPORTS: '- Capture energy, determination, and triumph\n- Reference iconic sports moments and cinematography\n- Balance action with human story',
    FASHION: '- Emphasize style, attitude, and aspiration\n- Reference fashion photography and film aesthetics\n- Consider movement, texture, and mood',
    BEAUTY: '- Focus on transformation, confidence, and intimacy\n- Lighting and closeup work are crucial\n- Balance aspiration with authenticity',
    LIFESTYLE: '- Create relatable, aspirational moments\n- Focus on real emotions and genuine connections\n- Show the brand fitting naturally into life',
    FOOD: '- Make it look delicious and irresistible\n- Consider texture, color, and appetite appeal\n- Balance beautiful imagery with human enjoyment',
    TRAVEL: '- Evoke wanderlust and discovery\n- Balance iconic locations with intimate moments\n- Consider cultural authenticity',
    LUXURY: '- Emphasize craftsmanship, exclusivity, and desire\n- Every detail matters\n- Sophisticated, never ostentatious',
    HEALTHCARE: '- Balance professionalism with empathy\n- Focus on human impact and trust\n- Avoid fear-based messaging',
    FINANCE: '- Build trust and clarity\n- Make complex ideas simple and relatable\n- Focus on human outcomes, not just numbers',
  };
  return guidelines[genre] || '';
}

export function buildChapterPrompt(
  chapter: Chapter,
  settings: TreatmentSettings,
  allContext: string
): string {
  const { brief, notes, chemistryCallNotes, reelLinks, additionalPrompts, toplineMode } = settings;

  const wordLimit = chapter.wordCountLimit || settings.wordCountLimits[chapter.id] || 
    (toplineMode ? 100 : 400);

  let prompt = `Write the "${chapter.title}" section of the treatment.

${brief ? `BRIEF:\n${brief}\n\n` : ''}
${notes ? `DIRECTOR'S NOTES:\n${notes}\n\n` : ''}
${chemistryCallNotes ? `CHEMISTRY CALL NOTES:\n${chemistryCallNotes}\n\n` : ''}
${reelLinks.length > 0 ? `DIRECTOR'S REEL REFERENCES:\n${reelLinks.join('\n')}\n\n` : ''}
${additionalPrompts ? `ADDITIONAL INSTRUCTIONS:\n${additionalPrompts}\n\n` : ''}

${allContext ? `OTHER SECTIONS FOR CONTEXT:\n${allContext}\n\n` : ''}

${getChapterGuidance(chapter.title)}

${toplineMode ? `MODE: TOPLINE - Provide a concise summary (max ${wordLimit} words)\n` : ''}
TARGET LENGTH: ${wordLimit} words (approximate)

Write ONLY the content for this section. Do not include the chapter title or any meta-commentary.`;

  return prompt;
}

function getChapterGuidance(chapterTitle: string): string {
  const guidance: Record<string, string> = {
    'INTRO': 'Set up the vision. Hook them immediately. What\'s the big idea? What feeling will this create?',
    'APPROACH': 'How will you bring this to life? What\'s your methodology and philosophy for this specific project?',
    'TONE': 'Describe the emotional atmosphere. Reference films, music, moments. Make them feel it.',
    'CASTING': 'Who are we casting and why? What qualities are you looking for? How will they embody the vision?',
    'PERFORMANCE': 'How will you direct the talent? What\'s the performance style? Natural? Stylized? How will you get there?',
    'CAMERA': 'Describe your visual approach. Movement, lenses, framing. How does the camera serve the story?',
    'LOOK & FEEL': 'Paint the picture. Color palette, lighting, mood, texture. Reference visual influences.',
    'EDIT': 'Pacing, rhythm, structure. How will the edit enhance the narrative and emotion?',
    'MUSIC': 'What role does music play? Genre, mood, specific tracks or original score? How does it elevate the spot?',
    'SOUND': 'Sound design, effects, atmosphere. How does audio complete the world?',
    'SCRIPTS': 'If there\'s dialogue or VO, how will it be delivered? What\'s the writing style and tone?',
    'CONCLUSION': 'Bring it home. Remind them why your vision wins. What makes this treatment special?',
  };
  
  return guidance[chapterTitle] || 'Provide compelling, specific content for this section.';
}

export function buildSmartEditPrompt(
  text: string,
  action: 'shorten' | 'expand' | 'tighten',
  settings: TreatmentSettings
): string {
  const actions: Record<string, string> = {
    shorten: 'Reduce this text by approximately 30-40% while preserving the key ideas and impact. Remove redundancy and unnecessary words.',
    expand: 'Expand this text by approximately 50% with more detail, examples, and vivid description. Add depth without padding.',
    tighten: 'Tighten this text to make it punchier and more impactful. Every word should earn its place. Remove any fluff.',
  };

  return `${buildSystemPrompt(settings)}

TASK: ${actions[action]}

ORIGINAL TEXT:
${text}

Provide ONLY the revised text, with no preamble or explanation.`;
}

export function buildAlternativeTitlesPrompt(chapterTitle: string, settings: TreatmentSettings): string {
  return `${buildSystemPrompt(settings)}

TASK: Suggest 3 alternative titles for the chapter currently called "${chapterTitle}".

Make them:
- Creative and engaging
- Appropriate for the tone and genre
- Professional but not boring
- Each should offer a different flavor/angle

Provide ONLY the three titles, one per line, with no numbering or explanation.`;
}

export function buildCharacterBiosPrompt(brief: string, settings: TreatmentSettings): string {
  return `${buildSystemPrompt(settings)}

BRIEF:
${brief}

TASK: Create detailed character biographies for the main characters/talent in this commercial.

For each character, provide:
- Name/Role
- Brief description (2-3 sentences)
- Key traits (3-5 bullet points)
- Background/context

Provide 2-4 character bios in a clear, structured format.`;
}

export function buildReferencesPrompt(brief: string, settings: TreatmentSettings): string {
  return `${buildSystemPrompt(settings)}

BRIEF:
${brief}

TASK: Suggest 3-5 film, TV, or commercial references that inform the visual style and approach.

For each reference, provide:
- Title
- Type (film/TV/commercial)
- Brief rationale (why it's relevant to this project)

Make references specific and meaningful, not generic.`;
}

export function buildScriptIdeasPrompt(brief: string, settings: TreatmentSettings): string {
  return `${buildSystemPrompt(settings)}

BRIEF:
${brief}

TASK: Generate 3-5 alternative scene or script ideas that could work for this commercial.

For each idea, provide:
- Scene number/name
- Description
- Sample dialogue (if applicable)
- Alternative approach or variation

Be creative and offer distinct options.`;
}

export function buildBonusOutputsPrompt(
  type: 'playlist' | 'watchlist' | 'moodboard',
  brief: string,
  settings: TreatmentSettings
): string {
  const tasks: Record<string, string> = {
    playlist: 'Create a music playlist (10-15 tracks) that captures the mood and energy of this project. Include artist - song title format.',
    watchlist: 'Create a watchlist (8-12 films/shows/commercials) for visual research that informs this project\'s style and approach.',
    moodboard: 'Suggest 10-15 visual references (photos, art, films, locations) that could inspire the mood board for this project.',
  };

  return `${buildSystemPrompt(settings)}

BRIEF:
${brief}

TASK: ${tasks[type]}

Provide a clear list with brief context where helpful.`;
}

