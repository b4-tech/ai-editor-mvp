import { create } from 'zustand';
import type { Treatment, Chapter, TreatmentSettings, Version, GeneratedExtras } from '../types/treatment';
import { DEFAULT_CHAPTERS, DEFAULT_SETTINGS } from '../types/treatment';
import { generateId } from '../lib/utils';

interface TreatmentStore {
  treatments: Treatment[];
  currentTreatment: Treatment | null;
  generatedExtras: GeneratedExtras | null;
  isGenerating: boolean;
  abortController: AbortController | null;

  // Treatment management
  createTreatment: (title: string) => void;
  loadTreatment: (id: string) => void;
  deleteTreatment: (id: string) => void;
  updateTreatmentTitle: (title: string) => void;
  saveTreatment: () => void;

  // Chapter management
  addChapter: (title: string, isCustom: boolean) => void;
  removeChapter: (chapterId: string) => void;
  updateChapter: (chapterId: string, content: string) => void;
  updateChapterTitle: (chapterId: string, title: string) => void;
  reorderChapters: (chapters: Chapter[]) => void;
  setAlternativeTitles: (chapterId: string, titles: string[]) => void;

  // Settings management
  updateSettings: (settings: Partial<TreatmentSettings>) => void;
  setWordCountLimit: (chapterId: string, limit: number) => void;

  // Version management
  saveVersion: () => void;
  loadVersion: (versionId: string) => void;

  // Generation
  setIsGenerating: (isGenerating: boolean) => void;
  setAbortController: (controller: AbortController | null) => void;
  setGeneratedExtras: (extras: GeneratedExtras | null) => void;

  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const createDefaultTreatment = (title: string): Treatment => {
  const now = new Date();
  const chapters: Chapter[] = DEFAULT_CHAPTERS.map((chapterTitle, index) => ({
    id: generateId(),
    title: chapterTitle,
    content: JSON.stringify({
      time: now.getTime(),
      blocks: [],
      version: '2.28.0'
    }),
    isCustom: false,
    order: index,
  }));

  return {
    id: generateId(),
    title,
    chapters,
    settings: { ...DEFAULT_SETTINGS },
    versions: [],
    createdAt: now,
    updatedAt: now,
  };
};

export const useTreatmentStore = create<TreatmentStore>((set, get) => ({
  treatments: [],
  currentTreatment: null,
  generatedExtras: null,
  isGenerating: false,
  abortController: null,

  createTreatment: (title: string) => {
    const newTreatment = createDefaultTreatment(title);
    set(state => ({
      treatments: [...state.treatments, newTreatment],
      currentTreatment: newTreatment,
    }));
    get().saveToStorage();
  },

  loadTreatment: (id: string) => {
    const treatment = get().treatments.find(t => t.id === id);
    if (treatment) {
      set({ currentTreatment: treatment });
    }
  },

  deleteTreatment: (id: string) => {
    set(state => ({
      treatments: state.treatments.filter(t => t.id !== id),
      currentTreatment: state.currentTreatment?.id === id ? null : state.currentTreatment,
    }));
    get().saveToStorage();
  },

  updateTreatmentTitle: (title: string) => {
    const { currentTreatment } = get();
    if (!currentTreatment) return;

    const updatedTreatment = {
      ...currentTreatment,
      title,
      updatedAt: new Date(),
    };

    set(state => ({
      currentTreatment: updatedTreatment,
      treatments: state.treatments.map(t =>
        t.id === updatedTreatment.id ? updatedTreatment : t
      ),
    }));
    get().saveToStorage();
  },

  saveTreatment: () => {
    const { currentTreatment } = get();
    if (!currentTreatment) return;

    const updatedTreatment = {
      ...currentTreatment,
      updatedAt: new Date(),
    };

    set(state => ({
      currentTreatment: updatedTreatment,
      treatments: state.treatments.map(t =>
        t.id === updatedTreatment.id ? updatedTreatment : t
      ),
    }));
    get().saveToStorage();
  },

  addChapter: (title: string, isCustom: boolean) => {
    const { currentTreatment } = get();
    if (!currentTreatment) return;

    const newChapter: Chapter = {
      id: generateId(),
      title,
      content: JSON.stringify({
        time: Date.now(),
        blocks: [],
        version: '2.28.0'
      }),
      isCustom,
      order: currentTreatment.chapters.length,
    };

    set(state => ({
      currentTreatment: state.currentTreatment
        ? {
            ...state.currentTreatment,
            chapters: [...state.currentTreatment.chapters, newChapter],
            updatedAt: new Date(),
          }
        : null,
    }));
    get().saveTreatment();
  },

  removeChapter: (chapterId: string) => {
    set(state => ({
      currentTreatment: state.currentTreatment
        ? {
            ...state.currentTreatment,
            chapters: state.currentTreatment.chapters.filter(c => c.id !== chapterId),
            updatedAt: new Date(),
          }
        : null,
    }));
    get().saveTreatment();
  },

  updateChapter: (chapterId: string, content: string) => {
    set(state => ({
      currentTreatment: state.currentTreatment
        ? {
            ...state.currentTreatment,
            chapters: state.currentTreatment.chapters.map(c =>
              c.id === chapterId ? { ...c, content } : c
            ),
            updatedAt: new Date(),
          }
        : null,
    }));
  },

  updateChapterTitle: (chapterId: string, title: string) => {
    set(state => ({
      currentTreatment: state.currentTreatment
        ? {
            ...state.currentTreatment,
            chapters: state.currentTreatment.chapters.map(c =>
              c.id === chapterId ? { ...c, title } : c
            ),
            updatedAt: new Date(),
          }
        : null,
    }));
    get().saveTreatment();
  },

  reorderChapters: (chapters: Chapter[]) => {
    console.log('🔄 Store: Reordering chapters...');
    console.log('📋 Input chapters:', chapters.map(c => `${c.title} (order: ${c.order})`));
    
    const reorderedChapters = chapters.map((c, index) => ({ ...c, order: index }));
    console.log('📋 Reordered chapters:', reorderedChapters.map(c => `${c.title} (new order: ${c.order})`));
    
    set(state => ({
      currentTreatment: state.currentTreatment
        ? {
            ...state.currentTreatment,
            chapters: reorderedChapters,
            updatedAt: new Date(),
          }
        : null,
    }));
    
    console.log('💾 Saving to localStorage...');
    get().saveTreatment();
    console.log('✅ Store: Chapters reordered and saved');
  },

  setAlternativeTitles: (chapterId: string, titles: string[]) => {
    set(state => ({
      currentTreatment: state.currentTreatment
        ? {
            ...state.currentTreatment,
            chapters: state.currentTreatment.chapters.map(c =>
              c.id === chapterId ? { ...c, alternativeTitles: titles } : c
            ),
          }
        : null,
    }));
  },

  updateSettings: (settings: Partial<TreatmentSettings>) => {
    set(state => ({
      currentTreatment: state.currentTreatment
        ? {
            ...state.currentTreatment,
            settings: { ...state.currentTreatment.settings, ...settings },
            updatedAt: new Date(),
          }
        : null,
    }));
    get().saveTreatment();
  },

  setWordCountLimit: (chapterId: string, limit: number) => {
    set(state => ({
      currentTreatment: state.currentTreatment
        ? {
            ...state.currentTreatment,
            settings: {
              ...state.currentTreatment.settings,
              wordCountLimits: {
                ...state.currentTreatment.settings.wordCountLimits,
                [chapterId]: limit,
              },
            },
            updatedAt: new Date(),
          }
        : null,
    }));
  },

  saveVersion: () => {
    const { currentTreatment } = get();
    if (!currentTreatment) return;

    const version: Version = {
      id: generateId(),
      treatmentId: currentTreatment.id,
      content: JSON.stringify(currentTreatment.chapters),
      timestamp: new Date(),
      chapters: JSON.parse(JSON.stringify(currentTreatment.chapters)),
    };

    set(state => ({
      currentTreatment: state.currentTreatment
        ? {
            ...state.currentTreatment,
            versions: [...state.currentTreatment.versions, version],
          }
        : null,
    }));
    get().saveTreatment();
  },

  loadVersion: (versionId: string) => {
    const { currentTreatment } = get();
    if (!currentTreatment) return;

    const version = currentTreatment.versions.find(v => v.id === versionId);
    if (version) {
      set(state => ({
        currentTreatment: state.currentTreatment
          ? {
              ...state.currentTreatment,
              chapters: version.chapters,
              updatedAt: new Date(),
            }
          : null,
      }));
      get().saveTreatment();
    }
  },

  setIsGenerating: (isGenerating: boolean) => {
    set({ isGenerating });
  },

  setAbortController: (controller: AbortController | null) => {
    set({ abortController: controller });
  },

  setGeneratedExtras: (extras: GeneratedExtras | null) => {
    set({ generatedExtras: extras });
  },

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem('treatments');
      if (stored) {
        const parsed = JSON.parse(stored);
        const treatments = parsed.map((t: Treatment) => {
          // Validate and fix chapter content
          const fixedChapters = t.chapters?.map((chapter: Chapter) => {
            if (chapter.content) {
              try {
                const content = JSON.parse(chapter.content);
                // If content is invalid or has empty blocks array, fix it
                if (!content.blocks || !Array.isArray(content.blocks) || content.blocks.length === 0) {
                  return {
                    ...chapter,
                    content: JSON.stringify({
                      time: Date.now(),
                      blocks: [],
                      version: '2.28.0'
                    })
                  };
                }
              } catch {
                // If parsing fails, reset to empty
                return {
                  ...chapter,
                  content: JSON.stringify({
                    time: Date.now(),
                      blocks: [],
                    version: '2.28.0'
                  })
                };
              }
            }
            return chapter;
          }) || [];

          return {
            ...t,
            chapters: fixedChapters,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            versions: t.versions?.map((v: Version) => ({
              ...v,
              timestamp: new Date(v.timestamp),
            })) || [],
          };
        });
        
        // Check if any chapters were fixed and save the corrected data
        const hasFixedChapters = treatments.some((t: Treatment) => 
          t.chapters?.some((chapter: Chapter) => {
            try {
              const content = JSON.parse(chapter.content);
              return content.blocks && content.blocks.length === 1 && 
                     content.blocks[0].type === 'paragraph' && 
                     content.blocks[0].data?.text === '';
            } catch {
              return false;
            }
          })
        );
        
        if (hasFixedChapters) {
          console.log('🔄 Fixed empty blocks, saving corrected data...');
          localStorage.setItem('treatments', JSON.stringify(treatments));
        }
        
        set({ treatments });
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
      // Clear corrupted data
      localStorage.removeItem('treatments');
    }
  },

  saveToStorage: () => {
    try {
      localStorage.setItem('treatments', JSON.stringify(get().treatments));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  },
}));

