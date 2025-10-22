import { useState } from 'react';
import { useTreatmentStore } from '../../store/treatmentStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { FileText, Plus, Trash2, Download, Clock } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { exportToPDF, exportToDOCX, exportToMarkdown } from '../../lib/export';

export function TreatmentSidebar() {
  const { 
    treatments, 
    currentTreatment, 
    createTreatment, 
    loadTreatment, 
    deleteTreatment 
  } = useTreatmentStore();
  
  const [newTreatmentTitle, setNewTreatmentTitle] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const handleCreateTreatment = () => {
    if (newTreatmentTitle.trim()) {
      createTreatment(newTreatmentTitle.trim());
      setNewTreatmentTitle('');
      setIsCreateDialogOpen(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'md') => {
    if (!currentTreatment) return;

    try {
      switch (format) {
        case 'pdf':
          await exportToPDF(currentTreatment);
          break;
        case 'docx':
          await exportToDOCX(currentTreatment);
          break;
        case 'md':
          exportToMarkdown(currentTreatment);
          break;
      }
      setExportMenuOpen(false);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  return (
    <div className="w-64 h-full overflow-y-auto border-r bg-background">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Treatments</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Treatment</DialogTitle>
                <DialogDescription>
                  Create a new treatment document
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Treatment Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Nike Air Max Campaign"
                    value={newTreatmentTitle}
                    onChange={(e) => setNewTreatmentTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateTreatment()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTreatment} disabled={!newTreatmentTitle.trim()}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {currentTreatment && (
          <div className="space-y-2">
            <Dialog open={exportMenuOpen} onOpenChange={setExportMenuOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Treatment</DialogTitle>
                  <DialogDescription>
                    Choose export format
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExport('pdf')}
                  >
                    Export as PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExport('docx')}
                  >
                    Export as DOCX
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleExport('md')}
                  >
                    Export as Markdown
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="space-y-2">
          {treatments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No treatments yet. Create one to get started!
            </p>
          ) : (
            treatments.map((treatment) => (
              <Card
                key={treatment.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                  currentTreatment?.id === treatment.id ? 'bg-accent border-primary' : ''
                }`}
                onClick={() => loadTreatment(treatment.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <h3 className="font-medium text-sm truncate">{treatment.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(treatment.updatedAt)}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this treatment?')) {
                        deleteTreatment(treatment.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

