import { useEffect, useState } from 'react';
import { useTreatmentStore } from './store/treatmentStore';
import { TreatmentSidebar } from './components/treatment/TreatmentSidebar';
import { ChapterManager } from './components/treatment/ChapterManager';
import { TreatmentEditor } from './components/editor/TreatmentEditor';
import { VersionHistory } from './components/treatment/VersionHistory';
import { ExtrasViewer } from './components/treatment/ExtrasViewer';
import { Phase2Notice } from './components/treatment/Phase2Notice';
import { AIChatSidebar } from './components/editor/AIChatSidebar';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { FileText, PanelLeft, PanelLeftClose, List, ListX, MessageSquare, MessageSquareX } from 'lucide-react';

function App() {
  const { 
    currentTreatment, 
    loadFromStorage, 
    updateTreatmentTitle,
    createTreatment,
  } = useTreatmentStore();
  
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [textReplacement, setTextReplacement] = useState<{old: string, new: string} | null>(null);
  const [showTreatmentsList, setShowTreatmentsList] = useState(true);
  const [showChaptersList, setShowChaptersList] = useState(true);
  const [showAIChat, setShowAIChat] = useState(true);

  useEffect(() => {
    loadFromStorage();
    
    // Load UI state from localStorage
    const savedShowTreatmentsList = localStorage.getItem('showTreatmentsList');
    const savedShowChaptersList = localStorage.getItem('showChaptersList');
    const savedShowAIChat = localStorage.getItem('showAIChat');
    
    if (savedShowTreatmentsList !== null) {
      setShowTreatmentsList(JSON.parse(savedShowTreatmentsList));
    }
    if (savedShowChaptersList !== null) {
      setShowChaptersList(JSON.parse(savedShowChaptersList));
    }
    if (savedShowAIChat !== null) {
      setShowAIChat(JSON.parse(savedShowAIChat));
    }

    // Listen for text selection events
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';
      
      // Only update if there's actual text selected and it's not too long
      if (text && text.length > 0 && text.length < 5000) {
        console.log('📝 Text selected:', text);
        console.log('📏 Selection length:', text.length);
        console.log('📍 First 50 chars:', text.substring(0, 50));
        console.log('📍 Last 50 chars:', text.substring(Math.max(0, text.length - 50)));
        setSelectedText(text);
      } else if (text.length === 0) {
        // Clear selection if nothing is selected
        if (selectedText) {
          console.log('🗑️ Selection cleared');
        }
        setSelectedText('');
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  useEffect(() => {
    // Auto-select first chapter when treatment loads
    if (currentTreatment && currentTreatment.chapters.length > 0 && !selectedChapterId) {
      setSelectedChapterId(currentTreatment.chapters[0].id);
    }
  }, [currentTreatment]);

  useEffect(() => {
    if (currentTreatment) {
      setTitle(currentTreatment.title);
    }
  }, [currentTreatment?.id]);

  const handleSaveTitle = () => {
    if (title.trim()) {
      updateTreatmentTitle(title.trim());
      setIsEditingTitle(false);
    }
  };

  const toggleTreatmentsList = () => {
    const newState = !showTreatmentsList;
    setShowTreatmentsList(newState);
    localStorage.setItem('showTreatmentsList', JSON.stringify(newState));
  };

  const toggleChaptersList = () => {
    const newState = !showChaptersList;
    setShowChaptersList(newState);
    localStorage.setItem('showChaptersList', JSON.stringify(newState));
  };

  const toggleAIChat = () => {
    const newState = !showAIChat;
    setShowAIChat(newState);
    localStorage.setItem('showAIChat', JSON.stringify(newState));
  };

  const handleReplaceText = (oldText: string, newText: string) => {
    console.log('🔄 Replace text requested:');
    console.log('   Old:', oldText);
    console.log('   New:', newText);
    setTextReplacement({ old: oldText, new: newText });
    // Clear selected text after replacement
    window.getSelection()?.removeAllRanges();
    setSelectedText('');
  };

  // Auto-save effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTreatment) {
        useTreatmentStore.getState().saveTreatment();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [currentTreatment]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-between px-6 bg-background">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <h1 className="text-xl font-bold">Victory Lap</h1>
          </div>
          
          {currentTreatment && (
            <div className="ml-8">
              {isEditingTitle ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') {
                      setIsEditingTitle(false);
                      setTitle(currentTreatment.title);
                    }
                  }}
                  className="w-96"
                  autoFocus
                />
              ) : (
                <h2
                  className="text-lg font-semibold cursor-pointer hover:text-primary"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {currentTreatment.title}
                </h2>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTreatmentsList}
            title={showTreatmentsList ? "Hide Treatments List" : "Show Treatments List"}
          >
            {showTreatmentsList ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>
          {currentTreatment && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleChaptersList}
              title={showChaptersList ? "Hide Chapters List" : "Show Chapters List"}
            >
              {showChaptersList ? (
                <ListX className="h-4 w-4" />
              ) : (
                <List className="h-4 w-4" />
              )}
            </Button>
          )}
          {currentTreatment && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleAIChat}
              title={showAIChat ? "Hide AI Chat" : "Show AI Chat"}
            >
              {showAIChat ? (
                <MessageSquareX className="h-4 w-4" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
            </Button>
          )}
          {currentTreatment && (
            <>
              <VersionHistory />
              <ExtrasViewer />
            </>
          )}
          <Phase2Notice />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Treatment List Sidebar */}
        {showTreatmentsList && <TreatmentSidebar />}

        {currentTreatment ? (
          <>
            {/* Chapter Manager */}
            {showChaptersList && (
              <ChapterManager
                selectedChapterId={selectedChapterId}
                onSelectChapter={setSelectedChapterId}
              />
            )}

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Editor Area */}
              <div className="flex-1 overflow-y-auto bg-white">
                {selectedChapterId ? (
                  <TreatmentEditor 
                    key={selectedChapterId} 
                    chapterId={selectedChapterId}
                    textReplacement={textReplacement}
                    onReplacementComplete={() => setTextReplacement(null)}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p>Select a chapter to start editing</p>
                  </div>
                )}
              </div>

              {/* AI Chat Sidebar */}
              {showAIChat && (
                <AIChatSidebar 
                  selectedText={selectedText}
                  onTextAction={(action, text) => {
                    console.log('Text action:', action, text);
                  }}
                  onReplaceText={handleReplaceText}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Welcome to Victory Lap</h2>
              <p className="text-muted-foreground max-w-md">
                Create your first treatment to get started with AI-powered commercial directing.
              </p>
              <Button
                size="lg"
                onClick={() => {
                  const title = prompt('Treatment title:');
                  if (title) createTreatment(title);
                }}
              >
                Create Treatment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
