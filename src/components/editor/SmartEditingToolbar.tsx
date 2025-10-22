import { useState } from 'react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Sparkles, Loader2 } from 'lucide-react';
import { smartEdit } from '../../lib/treatmentGenerator';
import { useTreatmentStore } from '../../store/treatmentStore';

interface SmartEditingToolbarProps {
  selectedText: string;
  chapterId: string;
  onEdit: (newText: string) => void;
}

export function SmartEditingToolbar({ selectedText, chapterId, onEdit }: SmartEditingToolbarProps) {
  const { currentTreatment } = useTreatmentStore();
  const [isEditing, setIsEditing] = useState(false);
  const [action, setAction] = useState<'shorten' | 'expand' | 'tighten' | null>(null);

  if (!currentTreatment || !selectedText) return null;

  const handleSmartEdit = async (editAction: 'shorten' | 'expand' | 'tighten') => {
    setIsEditing(true);
    setAction(editAction);
    
    try {
      // Generate a unique blockId for this edit operation
      const blockId = `edit-${Date.now()}`;
      const result = await smartEdit(
        selectedText,
        editAction,
        currentTreatment.settings,
        undefined,
        currentTreatment.id,
        chapterId,
        blockId
      );
      onEdit(result);
    } catch (error) {
      console.error('Smart edit error:', error);
    } finally {
      setIsEditing(false);
      setAction(null);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="bg-background border rounded-lg shadow-lg p-2 flex items-center gap-2">
        <span className="text-xs text-muted-foreground px-2">
          {selectedText.length} chars selected
        </span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" size="sm" disabled={isEditing}>
              {isEditing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  {action}...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-1" />
                  Smart Edit
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSmartEdit('shorten')}>
              Shorten
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSmartEdit('expand')}>
              Expand
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSmartEdit('tighten')}>
              Tighten
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

