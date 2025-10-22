import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { MessageCircle, Sparkles, Lightbulb, Paperclip, Image as ImageIcon, Send, Check, X, Loader2 } from 'lucide-react';
import { smartEdit } from '../../lib/treatmentGenerator';
import { useTreatmentStore } from '../../store/treatmentStore';
import { generateSessionId, generateCompletion } from '../../lib/openai';

interface AIChatSidebarProps {
  selectedText: string;
  onTextAction?: (action: string, text: string) => void;
  onReplaceText?: (oldText: string, newText: string) => void;
}

interface AISuggestion {
  action: string;
  originalText: string;
  suggestedText: string;
}

export function AIChatSidebar({ selectedText, onReplaceText }: AIChatSidebarProps) {
  const { currentTreatment } = useTreatmentStore();
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);

  const handleQuickAction = async (action: string) => {
    if (!selectedText || !currentTreatment) return;
    
    setIsProcessing(true);
    setCurrentAction(action);
    setSuggestion(null);

    try {
      let result = '';
      const sessionId = generateSessionId(
        currentTreatment.id,
        'ai-chat',
        `${action}-${Date.now()}`
      );

      if (action === 'shorten') {
        result = await smartEdit(
          selectedText,
          'shorten',
          currentTreatment.settings,
          undefined,
          currentTreatment.id,
          'ai-chat',
          sessionId
        );
      } else if (action === 'lengthen') {
        result = await smartEdit(
          selectedText,
          'expand',
          currentTreatment.settings,
          undefined,
          currentTreatment.id,
          'ai-chat',
          sessionId
        );
      } else if (action === 'improve') {
        const prompt = `Improve the following text while maintaining its meaning and tone. Return ONLY the improved text, nothing else:\n\n${selectedText}`;
        result = await generateCompletion(
          prompt,
          'You are an expert editor. Improve the text to make it more engaging, clear, and professional. Return ONLY the improved version without explanations, options, or commentary.',
          undefined,
          sessionId,
          {
            temperature: 0.7,
            max_tokens: 1500,
            style: 'casual',
          }
        );
      } else if (action === 'grammar') {
        const prompt = `Fix all grammar, spelling, and punctuation errors in the following text. Return ONLY the corrected text, nothing else:\n\n${selectedText}`;
        result = await generateCompletion(
          prompt,
          'You are a professional copy editor. Fix all errors while preserving the original meaning and style. Return ONLY the corrected version without explanations.',
          undefined,
          sessionId,
          {
            temperature: 0.3,
            max_tokens: 1500,
            style: 'formal',
          }
        );
      } else if (action === 'simplify') {
        const prompt = `Simplify the following text to make it clearer and easier to understand. Return ONLY the simplified text, nothing else:\n\n${selectedText}`;
        result = await generateCompletion(
          prompt,
          'You are an expert at simplifying complex text. Make it clearer and more accessible. Return ONLY the simplified version without explanations.',
          undefined,
          sessionId,
          {
            temperature: 0.6,
            max_tokens: 1500,
            style: 'casual',
          }
        );
      }

      if (result) {
        console.log('💡 Creating suggestion:');
        console.log('   Action:', action);
        console.log('   Original text:', selectedText);
        console.log('   Original text length:', selectedText.length);
        console.log('   Suggested text:', result.trim());
        console.log('   Suggested text length:', result.trim().length);
        
        setSuggestion({
          action,
          originalText: selectedText,
          suggestedText: result.trim(),
        });
      }
    } catch (error) {
      console.error('AI action error:', error);
      alert('Error processing text. Please try again.');
    } finally {
      setIsProcessing(false);
      setCurrentAction('');
    }
  };

  const handleApprove = () => {
    if (suggestion && onReplaceText) {
      console.log('✅ Approving suggestion:');
      console.log('   Action:', suggestion.action);
      console.log('   Original text length:', suggestion.originalText.length);
      console.log('   Suggested text length:', suggestion.suggestedText.length);
      onReplaceText(suggestion.originalText, suggestion.suggestedText);
      setSuggestion(null);
    }
  };

  const handleDecline = () => {
    setSuggestion(null);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      setMessage('');
    }, 2000);
  };

  return (
    <div className="w-80 chat-sidebar border-l flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h3 className="font-semibold text-sm">AI Assistant</h3>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Quick Actions */}
        <div>
          <h4 className="text-sm font-medium mb-3">What can I help you with?</h4>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => handleQuickAction('edit')}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Edit my writing
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => handleQuickAction('write')}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Write something new
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => handleQuickAction('ideas')}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Spark ideas
            </Button>
          </div>
        </div>

        {/* Selected Text Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Selected text</CardTitle>
              <button className="text-gray-400 hover:text-gray-600">
                <span className="text-xs">×</span>
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-sm mb-3 min-h-[40px]">
              {selectedText || 'No text selected'}
            </CardDescription>
            
            {selectedText && !suggestion && (
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => handleQuickAction('improve')}
                  disabled={isProcessing}
                >
                  {isProcessing && currentAction === 'improve' ? (
                    <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing...</>
                  ) : (
                    'Improve'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => handleQuickAction('grammar')}
                  disabled={isProcessing}
                >
                  {isProcessing && currentAction === 'grammar' ? (
                    <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing...</>
                  ) : (
                    'Fix Grammar'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => handleQuickAction('shorten')}
                  disabled={isProcessing}
                >
                  {isProcessing && currentAction === 'shorten' ? (
                    <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing...</>
                  ) : (
                    'Shorten'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => handleQuickAction('lengthen')}
                  disabled={isProcessing}
                >
                  {isProcessing && currentAction === 'lengthen' ? (
                    <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing...</>
                  ) : (
                    'Lengthen'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => handleQuickAction('simplify')}
                  disabled={isProcessing}
                >
                  {isProcessing && currentAction === 'simplify' ? (
                    <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Processing...</>
                  ) : (
                    'Simplify'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Suggestion Card */}
        {suggestion && (
          <Card className="border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Suggestion ({suggestion.action})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Original:</div>
                <div className="text-xs p-2 bg-red-50 border border-red-200 rounded">
                  {suggestion.originalText}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Suggested:</div>
                <div className="text-xs p-2 bg-green-50 border border-green-200 rounded">
                  {suggestion.suggestedText}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={handleApprove}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1"
                  onClick={handleDecline}
                >
                  <X className="h-3 w-3 mr-1" />
                  Decline
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat History Placeholder */}
        <div className="space-y-3">
          <div className="text-xs text-gray-500">Recent conversations</div>
          <div className="space-y-2">
            <div className="bg-white p-2 rounded text-xs text-gray-600">
              "Make this more engaging"
            </div>
            <div className="bg-white p-2 rounded text-xs text-gray-600">
              "Add more details about the camera work"
            </div>
            <div className="bg-white p-2 rounded text-xs text-gray-600">
              "Simplify the language"
            </div>
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t bg-white">
        <div className="space-y-2">
          <Textarea
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Paperclip className="h-4 w-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <ImageIcon className="h-4 w-4" />
              </button>
            </div>
            <Button 
              size="sm" 
              onClick={handleSendMessage}
              disabled={!message.trim() || isProcessing}
              className="flex items-center gap-1"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-3 w-3" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
