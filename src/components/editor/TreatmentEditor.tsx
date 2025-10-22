import { useEffect, useRef, useState, useMemo } from 'react';
import EditorJS, { type OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import { useTreatmentStore } from '../../store/treatmentStore';
import { Button } from '../ui/button';
import { Loader2, Sparkles, Trash2, Type, Bold, Italic, Underline, Strikethrough, Code, Link, Image, List as ListIcon, AlignLeft, AlignCenter, AlignRight, Indent, Outdent, Undo, Redo } from 'lucide-react';
import { generateChapter } from '../../lib/treatmentGenerator';

interface TreatmentEditorProps {
  chapterId: string;
  textReplacement?: {old: string, new: string} | null;
  onReplacementComplete?: () => void;
}

export function TreatmentEditor({ chapterId, textReplacement, onReplacementComplete }: TreatmentEditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  
  const { currentTreatment, updateChapter, setIsGenerating: setGlobalGenerating } = useTreatmentStore();
  
  const chapter = currentTreatment?.chapters.find(c => c.id === chapterId);
  
  // Debug logging
  console.log('🔍 TreatmentEditor render:', {
    chapterId,
    chapter: chapter?.title,
    currentTreatment: !!currentTreatment,
    isGenerating,
    wordCount
  });
  
  // Use ref to store latest updateChapter without causing re-renders
  const updateChapterRef = useRef(updateChapter);
  updateChapterRef.current = updateChapter;
  
  // Function to count words in editor content
  const updateWordCount = async () => {
    if (editorRef.current) {
      try {
        const data = await editorRef.current.save();
        let totalWords = 0;
        let paragraphCount = 0;
        let emptyParagraphs = 0;
        
        if (data.blocks && Array.isArray(data.blocks)) {
          data.blocks.forEach(block => {
            if (block.type === 'paragraph') {
              paragraphCount++;
              if (block.data && block.data.text) {
                const words = block.data.text.trim().split(/\s+/).filter((word: string) => word.length > 0);
                totalWords += words.length;
                if (words.length === 0) {
                  emptyParagraphs++;
                }
              } else {
                emptyParagraphs++;
              }
            }
          });
        }
        
        console.log(`📝 Word count: ${totalWords} words`);
        console.log(`📝 Paragraphs: ${paragraphCount} total, ${emptyParagraphs} empty`);
        setWordCount(totalWords);
      } catch (e) {
        console.error('Failed to count words:', e);
      }
    }
  };
  
  // Memoize initial chapter content to prevent re-initialization
  const initialContent = useMemo(() => {
    console.log('📌 Memoizing initial content for chapter:', chapterId);
    return chapter?.content;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]); // Only recalculate when chapter ID changes, not when content changes

  useEffect(() => {
    console.log('🔄 TreatmentEditor useEffect started');
    console.log('📋 Chapter ID:', chapterId);
    
    if (!holderRef.current || !initialContent) {
      console.log('⚠️ Early return: no holderRef or initialContent');
      return;
    }
    
    // Skip if editor already exists for this chapter
    if (editorRef.current) {
      console.log('⚠️ Editor already exists, skipping recreation');
      return;
    }

    let editorData: OutputData | undefined;
    
    console.log('📝 Raw chapter content:', initialContent);
    console.log('📏 Content length:', initialContent?.length || 0);
    
    // Parse existing content or create empty structure
    if (initialContent) {
      try {
        const parsed = JSON.parse(initialContent);
        console.log('✅ Parsed content:', parsed);
        console.log('🔍 Parsed type:', typeof parsed);
        console.log('🔍 Has blocks:', Array.isArray(parsed.blocks));
        console.log('🔍 Blocks count:', parsed.blocks?.length || 0);
        
        // Validate the structure more thoroughly
        if (parsed && 
            typeof parsed === 'object' && 
            Array.isArray(parsed.blocks)) {
          
          console.log('📦 Blocks before validation:', JSON.stringify(parsed.blocks, null, 2));
          
          // Validate each block
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const validBlocks = parsed.blocks.filter((block: any, index: number) => {
            console.log(`🔍 Validating block ${index}:`, block);
            console.log(`  - type: ${block?.type}`);
            console.log(`  - data: ${JSON.stringify(block?.data)}`);
            console.log(`  - has type: ${!!block?.type}`);
            console.log(`  - has data: ${!!block?.data}`);
            console.log(`  - data is object: ${typeof block?.data === 'object'}`);
            
            const isValid = block && 
              typeof block === 'object' && 
              block.type && 
              block.data &&
              typeof block.data === 'object';
            
            console.log(`  - ✅ Block ${index} valid:`, isValid);
            return isValid;
          });
          
          console.log('✅ Valid blocks count:', validBlocks.length);
          console.log('📦 Valid blocks:', JSON.stringify(validBlocks, null, 2));
          
          if (validBlocks.length > 0) {
            editorData = {
              time: parsed.time || Date.now(),
              blocks: validBlocks,
              version: parsed.version || '2.28.0'
            };
            console.log('✅ Final editorData:', JSON.stringify(editorData, null, 2));
          } else {
            console.log('❌ No valid blocks found, creating default single paragraph');
            editorData = {
              time: parsed.time || Date.now(),
              blocks: [
                {
                  type: 'paragraph',
                  data: {
                    text: ''
                  }
                }
              ],
              version: parsed.version || '2.28.0'
            };
          }
        } else {
          console.log('❌ Parsed data invalid structure');
          console.log('  - is object:', typeof parsed === 'object');
          console.log('  - has blocks array:', Array.isArray(parsed.blocks));
          console.log('  - blocks length > 0:', (parsed.blocks?.length || 0) > 0);
          editorData = undefined;
        }
      } catch (e) {
        console.error('❌ Failed to parse chapter content:', e);
        console.error('❌ Raw content that failed:', initialContent);
        editorData = undefined;
      }
    } else {
      console.log('ℹ️ No chapter content, starting with empty editor');
      // Create editor data with one empty paragraph
      editorData = {
        time: Date.now(),
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: ''
            }
          }
        ],
        version: '2.28.0'
      };
    }
    
    console.log('🎯 EditorData before initialization:', editorData ? 'defined' : 'undefined');

    console.log('🚀 Creating EditorJS instance...');
    
    const editor = new EditorJS({
      holder: holderRef.current,
      placeholder: 'Start writing your treatment here...',
      tools: {
        header: {
          // @ts-expect-error - EditorJS tool types
          class: Header,
          inlineToolbar: false,
          config: {
            placeholder: 'Enter chapter title',
            levels: [2, 3, 4],
            defaultLevel: 2,
          },
        },
        paragraph: {
          // @ts-expect-error - EditorJS tool types
          class: Paragraph,
          inlineToolbar: false,
          config: {
            placeholder: 'Write your treatment...',
          },
        },
        list: {
          class: List,
          inlineToolbar: false,
          config: {
            defaultStyle: 'unordered'
          },
        },
      },
      data: editorData,
      onChange: async () => {
        console.log('💾 onChange triggered');
        if (editorRef.current) {
          try {
            const data = await editorRef.current.save();
            console.log('📥 Saved data from editor:', JSON.stringify(data, null, 2));
            
            // Log paragraphs count
            const paragraphBlocks = data.blocks.filter(block => block.type === 'paragraph');
            console.log(`📊 Current paragraphs count: ${paragraphBlocks.length}`);
            console.log(`📊 Current total blocks count: ${data.blocks.length}`);
            
            // Update word count
            await updateWordCount();
            
            // Ensure data has proper structure
            const validData: OutputData = {
              time: data.time || Date.now(),
              blocks: data.blocks || [],
              version: data.version || '2.28.0'
            };
            
            console.log('✅ Valid data to store:', JSON.stringify(validData, null, 2));
            updateChapterRef.current(chapterId, JSON.stringify(validData));
            console.log('💾 Chapter updated successfully');
          } catch (e) {
            console.error('❌ Failed to save editor data:', e);
          }
        }
      },
      minHeight: 200,
      autofocus: false,
      readOnly: false,
      defaultBlock: 'paragraph',
      onReady: () => {
        console.log('✅ Editor is ready!');
        
        // Log initial blocks count
        if (editorRef.current) {
          editorRef.current.save().then((data) => {
            const paragraphBlocks = data.blocks.filter(block => block.type === 'paragraph');
            console.log(`📊 Initial paragraphs count: ${paragraphBlocks.length}`);
            console.log(`📊 Total blocks count: ${data.blocks.length}`);
            console.log(`📦 Initial blocks:`, JSON.stringify(data.blocks, null, 2));
            
            // If we have more than 1 block and they're both empty paragraphs, remove the duplicate
            if (paragraphBlocks.length > 1) {
              const emptyParagraphs = paragraphBlocks.filter(block => 
                !block.data?.text || block.data.text.trim() === ''
              );
              console.log(`⚠️ Found ${emptyParagraphs.length} empty paragraphs out of ${paragraphBlocks.length} total`);
            }
          }).catch(console.error);
        }
        
        // Add text selection listener
        const editorElement = holderRef.current;
        if (editorElement) {

          // Add drag and drop functionality
          const handleDragOver = (e: DragEvent) => {
            e.preventDefault();
            e.dataTransfer!.dropEffect = 'copy';
            setIsDragOver(true);
          };

          const handleDragLeave = (e: DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
          };

          const handleDrop = (e: DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            const files = Array.from(e.dataTransfer!.files);
            
            files.forEach(file => {
              if (file.type.startsWith('text/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const text = event.target?.result as string;
                  if (text) {
                    // Insert text into editor
                    const editor = editorRef.current;
                    if (editor) {
                      console.log('📁 Inserting file content as new paragraph');
                      editor.blocks.insert('paragraph', {
                        text: text
                      });
                      // Log updated count after insertion
                      setTimeout(() => {
                        editor.save().then((data) => {
                          const paragraphBlocks = data.blocks.filter(block => block.type === 'paragraph');
                          console.log(`📊 Paragraphs after file insertion: ${paragraphBlocks.length}`);
                        });
                      }, 100);
                    }
                  }
                };
                reader.readAsText(file);
              }
            });
          };

          editorElement.addEventListener('dragover', handleDragOver);
          editorElement.addEventListener('dragleave', handleDragLeave);
          editorElement.addEventListener('drop', handleDrop);
          
          return () => {
            editorElement.removeEventListener('dragover', handleDragOver);
            editorElement.removeEventListener('dragleave', handleDragLeave);
            editorElement.removeEventListener('drop', handleDrop);
          };
        }
      },
    });

    console.log('⏳ Waiting for editor to be ready...');
    
    editor.isReady.then(async () => {
      console.log('🎉 Editor initialization successful!');
      editorRef.current = editor;
      
      // Log initial blocks after editor is ready
      try {
        const initialData = await editor.save();
        console.log('📋 Initial blocks after editor ready:', initialData.blocks?.length || 0);
        console.log('📦 Initial blocks data:', JSON.stringify(initialData.blocks, null, 2));
        
        // Update word count for initial content
        await updateWordCount();
      } catch (e) {
        console.error('❌ Failed to get initial editor data:', e);
      }
    }).catch((error) => {
      console.error('❌ Editor.js initialization failed:', error);
      console.error('❌ Error stack:', error.stack);
    });

    return () => {
      console.log('🧹 Cleanup: Destroying editor');
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
        console.log('✅ Editor destroyed');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]); // Only depend on chapterId to recreate editor when switching chapters

  // Handle text replacement from AI suggestions
  useEffect(() => {
    if (!textReplacement || !editorRef.current) return;

    const replaceTextInEditor = async () => {
      try {
        const editor = editorRef.current;
        if (!editor) return;

        console.log('🔄 Replacing text:', textReplacement);

        const data = await editor.save();
        let replaced = false;
        let replacedBlockIndex = -1;

        // Helper function to strip HTML tags and normalize text
        const stripHtml = (html: string) => {
          const tmp = document.createElement('div');
          tmp.innerHTML = html;
          const text = tmp.textContent || tmp.innerText || '';
          // Normalize whitespace and trim
          return text.replace(/\s+/g, ' ').trim();
        };

        // Normalize the search text
        const normalizedSearchText = textReplacement.old.replace(/\s+/g, ' ').trim();

        console.log('🔍 Searching for text:', normalizedSearchText);
        console.log('🔍 Total blocks:', data.blocks.length);
        console.log('🔍 All blocks:', JSON.stringify(data.blocks, null, 2));

        // Go through all blocks and find the one containing the selected text
        const updatedBlocks = data.blocks.map((block, index) => {
          console.log(`\n📦 Block ${index}:`, {
            type: block.type,
            hasData: !!block.data,
            hasText: !!block.data?.text,
            data: block.data
          });

          // Support all block types that have text (paragraph, header, list, etc.)
          if (block.data?.text) {
            const htmlText = block.data.text;
            const plainText = stripHtml(htmlText);
            
            console.log(`📄 Block ${index} (${block.type}) plain text:`, plainText);
            console.log(`📏 Plain text length:`, plainText.length);
            console.log(`📏 Search text length:`, normalizedSearchText.length);
            console.log(`🔍 Contains search text?`, plainText.includes(normalizedSearchText));
            
            // Also try partial match to debug
            const searchWords = normalizedSearchText.split(' ').slice(0, 5).join(' ');
            console.log(`🔍 First 5 words of search:`, searchWords);
            console.log(`🔍 Block contains first 5 words?`, plainText.includes(searchWords));
            
            // Check if this block contains the selected text (normalized comparison)
            // Try exact match first
            let foundMatch = false;
            let matchedText = normalizedSearchText;
            
            if (plainText.includes(normalizedSearchText)) {
              foundMatch = true;
            } else {
              // Try fuzzy match - maybe the selection was cut off
              // Check if the plain text starts with the search text (90% match)
              const minMatchLength = Math.floor(normalizedSearchText.length * 0.9);
              const partialSearch = normalizedSearchText.substring(0, minMatchLength);
              
              console.log(`🔍 Trying partial match (${minMatchLength} chars):`, partialSearch);
              
              if (plainText.includes(partialSearch)) {
                console.log('✅ Found partial match!');
                // Find the actual full text in the block
                const searchStart = plainText.indexOf(partialSearch);
                // Extend to the end of the sentence or similar length
                const potentialEnd = searchStart + normalizedSearchText.length + 20;
                const fullTextInBlock = plainText.substring(searchStart, Math.min(potentialEnd, plainText.length));
                
                console.log('📝 Full text in block:', fullTextInBlock);
                matchedText = fullTextInBlock.substring(0, normalizedSearchText.length);
                foundMatch = true;
              }
            }
            
            if (foundMatch) {
              replaced = true;
              replacedBlockIndex = index;
              
              console.log('✅ Found matching block!', index);
              console.log('   Original HTML:', htmlText);
              console.log('   Original plain:', plainText);
              console.log('   Matched text:', matchedText);
              
              // Replace the text - work with plain text to avoid HTML issues
              const newPlainText = plainText.replace(matchedText, textReplacement.new);
              
              console.log('   New plain:', newPlainText);
              
              return {
                ...block,
                data: {
                  ...block.data,
                  text: newPlainText
                }
              };
            }
          } else {
            console.log(`⚠️ Block ${index} skipped - type: ${block.type}, has data: ${!!block.data}, has text: ${!!block.data?.text}`);
          }
          return block;
        });

        if (replaced) {
          console.log('✅ Found text in block', replacedBlockIndex);
          
          // Clear and re-render the editor with updated content
          await editor.clear();
          await editor.render({ blocks: updatedBlocks });
          
          // Wait a bit for render to complete
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Save the updated content
          const newData = await editor.save();
          updateChapterRef.current(chapterId, JSON.stringify(newData));
          
          // Update word count
          await updateWordCount();
          
          console.log('✅ Text replaced and saved successfully');
        } else {
          console.warn('⚠️ Could not find text to replace:', textReplacement.old);
        }

        // Notify completion
        if (onReplacementComplete) {
          onReplacementComplete();
        }
      } catch (error) {
        console.error('Error replacing text:', error);
        if (onReplacementComplete) {
          onReplacementComplete();
        }
      }
    };

    replaceTextInEditor();
  }, [textReplacement, chapterId, onReplacementComplete]);

  const handleGenerate = async () => {
    console.log('🎨 Generate button clicked');
    console.log('📋 Chapter:', chapter);
    console.log('📋 Current Treatment:', currentTreatment);
    console.log('📋 Is Generating:', isGenerating);
    
    if (!chapter || !currentTreatment) {
      console.log('⚠️ Cannot generate: no chapter or treatment');
      console.log('  - Chapter exists:', !!chapter);
      console.log('  - Current Treatment exists:', !!currentTreatment);
      return;
    }

    console.log('🚀 Starting generation...');
    setIsGenerating(true);
    setGlobalGenerating(true);

    try {
      const otherChapters = currentTreatment.chapters.filter(c => c.id !== chapterId);
      console.log('📚 Other chapters count:', otherChapters.length);
      
      const controller = new AbortController();
      
      console.log('🤖 Calling Anthropic API...');
      const fullText = await generateChapter(
        chapter,
        currentTreatment.settings,
        otherChapters,
        undefined,
        controller.signal,
        currentTreatment.id
      );
      
      console.log('✅ Generated text:', fullText);
      console.log('📏 Generated text length:', fullText.length);

      // Split text into paragraphs and create proper blocks
      const paragraphs = fullText.split('\n\n').filter(p => p.trim());
      console.log('📄 Paragraphs count:', paragraphs.length);
      
      // Create Editor.js blocks with proper structure
      const blocks = paragraphs.map((para, index) => {
        const block = {
          id: `block_${Date.now()}_${index}`,
          type: 'paragraph',
          data: {
            text: para.trim(),
          },
        };
        console.log(`📦 Created block ${index}:`, block);
        return block;
      });

      // Ensure we have at least one block
      const finalBlocks = blocks.length > 0 ? blocks : [{
        id: `block_${Date.now()}`,
        type: 'paragraph',
        data: {
          text: fullText,
        },
      }];
      
      console.log('📦 Final blocks count:', finalBlocks.length);
      console.log('📦 Final blocks:', JSON.stringify(finalBlocks, null, 2));

      const editorData: OutputData = {
        time: Date.now(),
        blocks: finalBlocks,
        version: '2.28.0',
      };
      
      console.log('📋 Editor data to render:', JSON.stringify(editorData, null, 2));

      // Update editor with generated content
      if (editorRef.current) {
        console.log('🔄 Rendering generated content in editor...');
        await editorRef.current.render(editorData);
        console.log('✅ Content rendered successfully');
      } else {
        console.log('⚠️ Editor ref is null, cannot render');
      }

      // Save to store
      console.log('💾 Saving to store...');
      updateChapter(chapterId, JSON.stringify(editorData));
      console.log('✅ Saved to store successfully');
      
      // Update word count after generation
      await updateWordCount();
    } catch (error) {
      console.error('❌ Error generating chapter:', error);
      console.error('❌ Error stack:', (error as Error).stack);
    } finally {
      console.log('🏁 Generation finished');
      setIsGenerating(false);
      setGlobalGenerating(false);
    }
  };

  const handleClearChapter = async () => {
    console.log('🗑️ Clear chapter button clicked');
    console.log('📋 Chapter ID:', chapterId);
    console.log('📋 Editor Ref:', editorRef.current);
    
    if (!confirm('Clear all content in this chapter?')) {
      console.log('❌ Clear cancelled by user');
      return;
    }
    
    console.log('🧹 Clearing chapter...');
    
    const emptyData: OutputData = {
      time: Date.now(),
      blocks: [],
      version: '2.28.0',
    };
    
    console.log('📋 Empty data:', JSON.stringify(emptyData, null, 2));

    if (editorRef.current) {
      try {
        console.log('🔄 Rendering empty data...');
        await editorRef.current.render(emptyData);
        console.log('✅ Editor cleared successfully');
        
        // Log paragraph count after clearing
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.save().then((data) => {
              const paragraphBlocks = data.blocks.filter(block => block.type === 'paragraph');
              console.log(`📊 Paragraphs after clear: ${paragraphBlocks.length}`);
            });
          }
        }, 100);
      } catch (e) {
        console.error('❌ Failed to clear editor:', e);
        // Force clear by destroying and recreating
        if (editorRef.current.destroy) {
          console.log('🧹 Force destroying editor...');
          editorRef.current.destroy();
        }
        // The useEffect will recreate the editor
      }
    }

    console.log('💾 Updating chapter with empty data...');
    updateChapter(chapterId, JSON.stringify(emptyData));
    console.log('✅ Chapter cleared and saved');
    
    // Update word count after clearing
    setWordCount(0);
  };

  const handleResetChapter = async () => {
    console.log('🔄 Reset chapter button clicked');
    console.log('📋 Chapter ID:', chapterId);
    console.log('📋 Editor Ref:', editorRef.current);
    
    if (!confirm('Reset chapter to clean state? This will fix any data corruption.')) {
      console.log('❌ Reset cancelled by user');
      return;
    }
    
    console.log('🔄 Resetting chapter...');
    
    // Force destroy and recreate editor
    if (editorRef.current && editorRef.current.destroy) {
      console.log('🧹 Destroying editor...');
      editorRef.current.destroy();
      editorRef.current = null;
      console.log('✅ Editor destroyed');
    }
    
    // Set empty content
    const emptyData: OutputData = {
      time: Date.now(),
      blocks: [],
      version: '2.28.0',
    };
    
    console.log('📋 Empty data:', JSON.stringify(emptyData, null, 2));
    console.log('💾 Updating chapter...');
    updateChapter(chapterId, JSON.stringify(emptyData));
    console.log('✅ Chapter reset');
    console.log('📊 Paragraphs after reset: 0 (empty blocks array)');
    
    // Force re-render by updating the key
    console.log('🔄 Reloading page in 100ms...');
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (!chapter) return null;

  return (
    <div className="h-full flex flex-col relative">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <h2 className="text-2xl font-bold">{chapter.title}</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              console.log('🔘 Clear button clicked');
              handleClearChapter();
            }}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
          <Button
            onClick={() => {
              console.log('🔘 Reset button clicked');
              handleResetChapter();
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            🔄 Reset
          </Button>
          <Button
            onClick={() => {
              console.log('🔘 Generate button clicked');
              handleGenerate();
            }}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b editor-toolbar">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Type className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Underline className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Strikethrough className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Code className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Link className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Image className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ListIcon className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <AlignRight className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Indent className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Outdent className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Redo className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="text-xs font-bold">I+</span>
        </Button>
      </div>
      
      {/* Editor Area */}
      <div 
        ref={holderRef}
        className={`flex-1 prose prose-sm max-w-none p-6 ${isDragOver ? 'drag-over' : ''}`}
        style={{ minHeight: '400px' }}
      />

      {/* Word Count */}
      <div className="absolute bottom-4 left-4 word-count px-2 py-1 rounded text-xs text-gray-600">
        <span className="text-gray-600">
          {wordCount} words total
        </span>
      </div>

      {/* Drag & Drop Indicator */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-50 bg-opacity-50 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-4xl mb-2">📄</div>
            <div className="text-lg font-medium text-blue-600">Drop files here</div>
            <div className="text-sm text-blue-500">Text files will be imported</div>
          </div>
        </div>
      )}

    </div>
  );
}

