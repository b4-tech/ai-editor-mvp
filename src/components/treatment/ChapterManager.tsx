import React, { useState } from 'react';
import { useTreatmentStore } from '../../store/treatmentStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Plus, Trash2, GripVertical, Edit2, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChapterManagerProps {
  selectedChapterId: string | null;
  onSelectChapter: (id: string) => void;
}

export function ChapterManager({ selectedChapterId, onSelectChapter }: ChapterManagerProps) {
  const { currentTreatment, addChapter, removeChapter, updateChapterTitle, reorderChapters } = useTreatmentStore();
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!currentTreatment) return null;

  const sortedChapters = [...currentTreatment.chapters].sort((a, b) => a.order - b.order);

  const handleAddChapter = () => {
    if (newChapterTitle.trim()) {
      addChapter(newChapterTitle.trim(), true);
      setNewChapterTitle('');
    }
  };

  const startEditing = (chapterId: string, currentTitle: string) => {
    setEditingChapterId(chapterId);
    setEditTitle(currentTitle);
  };

  const saveEdit = () => {
    if (editingChapterId && editTitle.trim()) {
      updateChapterTitle(editingChapterId, editTitle.trim());
      setEditingChapterId(null);
    }
  };

  const cancelEdit = () => {
    setEditingChapterId(null);
    setEditTitle('');
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    console.log(`🖱️ Drag started for chapter ${index}: ${sortedChapters[index]?.title}`);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
    console.log(`🎯 Drag over chapter ${index}: ${sortedChapters[index]?.title}`);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    console.log(`📦 Drop on chapter ${dropIndex}: ${sortedChapters[dropIndex]?.title}`);
    console.log(`📦 Dragged from index: ${draggedIndex}`);
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      console.log('❌ Drop cancelled: same position or no drag');
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newChapters = [...sortedChapters];
    const [draggedChapter] = newChapters.splice(draggedIndex, 1);
    newChapters.splice(dropIndex, 0, draggedChapter);

    console.log('🔄 Reordering chapters...');
    console.log('📋 New order:', newChapters.map(c => c.title));
    
    reorderChapters(newChapters);
    setDraggedIndex(null);
    setDragOverIndex(null);
    
    console.log('✅ Chapters reordered successfully');
  };

  const handleDragEnd = () => {
    console.log('🏁 Drag ended');
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="w-64 h-full overflow-y-auto border-r bg-muted/30">
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-semibold mb-3">Chapters</h3>
        
        {sortedChapters.map((chapter, index) => (
          <div 
            key={chapter.id} 
            className="relative group"
            draggable={editingChapterId !== chapter.id}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <Card
              className={cn(
                "p-3 cursor-pointer transition-all",
                selectedChapterId === chapter.id && "bg-accent border-primary",
                draggedIndex === index && "opacity-50",
                dragOverIndex === index && draggedIndex !== index && "border-primary border-2",
                editingChapterId !== chapter.id && "hover:bg-accent"
              )}
              onClick={() => onSelectChapter(chapter.id)}
            >
              {editingChapterId === chapter.id ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="h-7 text-sm"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={saveEdit}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={cancelEdit}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <GripVertical 
                      className="h-4 w-4 text-muted-foreground flex-shrink-0 cursor-grab active:cursor-grabbing" 
                    />
                    <span className="text-sm font-medium truncate">{chapter.title}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(chapter.id, chapter.title);
                      }}
                      title="Edit title"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    {chapter.isCustom && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeChapter(chapter.id);
                        }}
                        title="Remove chapter"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        ))}

        <div className="pt-2">
          <div className="flex gap-2">
            <Input
              placeholder="New chapter..."
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
              className="h-9 text-sm"
            />
            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 flex-shrink-0"
              onClick={handleAddChapter}
              disabled={!newChapterTitle.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

