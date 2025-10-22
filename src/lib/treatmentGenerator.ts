import type { Chapter, TreatmentSettings, GeneratedExtras } from '../types/treatment';
import { generateText, generateCompletion, generateSessionId, type GenerationParams } from './openai';
import { naturalizeText } from './naturalLanguageFilter';
import type { ToneType } from '../types/treatment';
import {
  buildSystemPrompt,
  buildChapterPrompt,
  buildAlternativeTitlesPrompt,
  buildCharacterBiosPrompt,
  buildReferencesPrompt,
  buildScriptIdeasPrompt,
  buildBonusOutputsPrompt,
  buildSmartEditPrompt,
} from './prompts';

// Map treatment tone to API style parameter
function mapToneToStyle(tone: ToneType): string {
  const styleMap: Record<ToneType, string> = {
    DIRECT: 'formal',
    CONVERSATIONAL: 'casual',
    FUNNY: 'casual',
    POETIC: 'poetic',
  };
  return styleMap[tone] || 'casual';
}

// Build additional context from treatment settings
function buildAdditionalContext(settings: TreatmentSettings): string {
  const parts: string[] = [];
  
  if (settings.brief) {
    parts.push(`BRIEF: ${settings.brief}`);
  }
  if (settings.notes) {
    parts.push(`DIRECTOR'S NOTES: ${settings.notes}`);
  }
  if (settings.chemistryCallNotes) {
    parts.push(`CHEMISTRY CALL NOTES: ${settings.chemistryCallNotes}`);
  }
  if (settings.reelLinks?.length > 0) {
    parts.push(`REEL REFERENCES: ${settings.reelLinks.join(', ')}`);
  }
  if (settings.additionalPrompts) {
    parts.push(`ADDITIONAL INSTRUCTIONS: ${settings.additionalPrompts}`);
  }
  
  return parts.join('\n\n');
}

export async function generateChapter(
  chapter: Chapter,
  settings: TreatmentSettings,
  otherChapters: Chapter[],
  onChunk?: (text: string) => void,
  signal?: AbortSignal,
  treatmentId?: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt(settings);
  
  // Build context from other chapters
  const context = otherChapters
    .filter(c => c.id !== chapter.id && c.content)
    .map(c => `${c.title}:\n${c.content}`)
    .join('\n\n');

  const userPrompt = buildChapterPrompt(chapter, settings, context);

  // Generate session ID for this chapter generation
  const sessionId = treatmentId 
    ? generateSessionId(treatmentId, chapter.id, 'chapter-gen')
    : `chapter-${chapter.id}-${Date.now()}`;

  // Set parameters for chapter generation (creative, expansive)
  const params: GenerationParams = {
    temperature: 0.85,
    max_tokens: 2000,
    style: mapToneToStyle(settings.tone),
    additional_context: buildAdditionalContext(settings),
    top_p: 0.9,
    top_k: 50,
  };

  let generatedText = await generateText(
    userPrompt,
    systemPrompt,
    onChunk,
    signal,
    sessionId,
    params
  );

  // Apply natural language filter if enabled
  if (settings.naturalizeText) {
    generatedText = naturalizeText(generatedText);
  }

  return generatedText;
}

export async function generateAlternativeTitles(
  chapterTitle: string,
  settings: TreatmentSettings,
  signal?: AbortSignal,
  treatmentId?: string,
  chapterId?: string
): Promise<string[]> {
  const systemPrompt = buildSystemPrompt(settings);
  const userPrompt = buildAlternativeTitlesPrompt(chapterTitle, settings);

  // Generate session ID for alternative titles
  const sessionId = treatmentId && chapterId
    ? generateSessionId(treatmentId, chapterId, 'alt-titles')
    : `alt-titles-${Date.now()}`;

  // Parameters for alternative titles (creative but focused)
  const params: GenerationParams = {
    temperature: 0.8,
    max_tokens: 200,
    style: mapToneToStyle(settings.tone),
    top_p: 0.9,
    top_k: 50,
  };

  const response = await generateCompletion(userPrompt, systemPrompt, signal, sessionId, params);
  
  return response
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, 3);
}

export async function smartEdit(
  text: string,
  action: 'shorten' | 'expand' | 'tighten',
  settings: TreatmentSettings,
  signal?: AbortSignal,
  treatmentId?: string,
  chapterId?: string,
  blockId?: string
): Promise<string> {
  const prompt = buildSmartEditPrompt(text, action, settings);
  
  // Generate session ID for this specific block edit
  const sessionId = treatmentId && chapterId && blockId
    ? generateSessionId(treatmentId, chapterId, blockId)
    : `smart-edit-${Date.now()}`;

  // Task-specific parameters for smart edits
  let params: GenerationParams;
  
  if (action === 'shorten' || action === 'tighten') {
    // Lower temperature for precision, minimal style
    params = {
      temperature: 0.5,
      max_tokens: 1500,
      style: 'minimal',
      top_p: 0.85,
      top_k: 40,
    };
  } else {
    // Expand: more creative, use treatment tone
    params = {
      temperature: 0.7,
      max_tokens: 2000,
      style: mapToneToStyle(settings.tone),
      top_p: 0.9,
      top_k: 50,
    };
  }

  let result = await generateCompletion(prompt, '', signal, sessionId, params);

  if (settings.naturalizeText) {
    result = naturalizeText(result);
  }

  return result;
}

export async function generateExtras(
  settings: TreatmentSettings,
  signal?: AbortSignal,
  treatmentId?: string
): Promise<GeneratedExtras> {
  const extras: GeneratedExtras = {};
  const brief = settings.brief || '';
  const systemPrompt = buildSystemPrompt(settings);

  // Parameters for extras generation (balanced creativity)
  const extrasParams: GenerationParams = {
    temperature: 0.7,
    max_tokens: 1500,
    style: mapToneToStyle(settings.tone),
    additional_context: buildAdditionalContext(settings),
    top_p: 0.9,
    top_k: 50,
  };

  try {
    if (settings.enableCharacterBios && brief) {
      const bioPrompt = buildCharacterBiosPrompt(brief, settings);
      const sessionId = treatmentId 
        ? generateSessionId(treatmentId, 'extras', 'character-bios')
        : `extras-bios-${Date.now()}`;
      const bioText = await generateCompletion(bioPrompt, systemPrompt, signal, sessionId, extrasParams);
      extras.characterBios = parseCharacterBios(bioText);
    }

    if (settings.enableReferences && brief) {
      const refPrompt = buildReferencesPrompt(brief, settings);
      const sessionId = treatmentId 
        ? generateSessionId(treatmentId, 'extras', 'references')
        : `extras-refs-${Date.now()}`;
      const refText = await generateCompletion(refPrompt, systemPrompt, signal, sessionId, extrasParams);
      extras.references = parseReferences(refText);
    }

    if (settings.enableScriptIdeas && brief) {
      const scriptPrompt = buildScriptIdeasPrompt(brief, settings);
      const sessionId = treatmentId 
        ? generateSessionId(treatmentId, 'extras', 'script-ideas')
        : `extras-scripts-${Date.now()}`;
      const scriptText = await generateCompletion(scriptPrompt, systemPrompt, signal, sessionId, extrasParams);
      extras.scriptIdeas = parseScriptIdeas(scriptText);
    }

    if (settings.enableBonusOutputs && brief) {
      const bonusOutputs = [];
      
      const playlistPrompt = buildBonusOutputsPrompt('playlist', brief, settings);
      const playlistSessionId = treatmentId 
        ? generateSessionId(treatmentId, 'extras', 'playlist')
        : `extras-playlist-${Date.now()}`;
      const playlistText = await generateCompletion(playlistPrompt, systemPrompt, signal, playlistSessionId, extrasParams);
      bonusOutputs.push({
        type: 'playlist' as const,
        title: 'Music Playlist',
        items: playlistText.split('\n').filter(line => line.trim()),
      });

      const watchlistPrompt = buildBonusOutputsPrompt('watchlist', brief, settings);
      const watchlistSessionId = treatmentId 
        ? generateSessionId(treatmentId, 'extras', 'watchlist')
        : `extras-watchlist-${Date.now()}`;
      const watchlistText = await generateCompletion(watchlistPrompt, systemPrompt, signal, watchlistSessionId, extrasParams);
      bonusOutputs.push({
        type: 'watchlist' as const,
        title: 'Visual References Watchlist',
        items: watchlistText.split('\n').filter(line => line.trim()),
      });

      extras.bonusOutputs = bonusOutputs;
    }
  } catch (error) {
    console.error('Error generating extras:', error);
  }

  return extras;
}

function parseCharacterBios(text: string): any[] {
  // Simple parsing - in production, this would be more sophisticated
  const bios = [];
  const sections = text.split(/\n\n+/);
  
  for (const section of sections) {
    if (section.trim()) {
      const lines = section.split('\n');
      const nameMatch = lines[0].match(/(?:Name|Character|Role):?\s*(.+)/i);
      
      bios.push({
        name: nameMatch ? nameMatch[1].trim() : lines[0].trim(),
        description: lines.slice(1, 3).join(' ').trim(),
        traits: lines.filter(l => l.includes('-') || l.includes('•')).map(l => l.replace(/[-•]\s*/, '').trim()),
        background: lines.slice(-1)[0]?.trim() || '',
      });
    }
  }
  
  return bios;
}

function parseReferences(text: string): any[] {
  const references = [];
  const lines = text.split('\n').filter(l => l.trim());
  
  for (const line of lines) {
    const titleMatch = line.match(/["']([^"']+)["']/);
    const typeMatch = line.match(/\((film|tv|commercial)\)/i);
    
    references.push({
      title: titleMatch ? titleMatch[1] : line.split(/[-–]/)[0]?.trim() || line,
      type: typeMatch ? typeMatch[1].toLowerCase() : 'film',
      rationale: line.split(/[-–]/).slice(1).join('-').trim() || '',
    });
  }
  
  return references;
}

function parseScriptIdeas(text: string): any[] {
  const ideas = [];
  const sections = text.split(/\n\n+/);
  
  sections.forEach((section, index) => {
    if (section.trim()) {
      ideas.push({
        sceneNumber: index + 1,
        description: section.trim(),
        dialogue: section.includes('"') ? section.match(/"([^"]+)"/)?.[1] : undefined,
        alternativeApproach: undefined,
      });
    }
  });
  
  return ideas;
}

