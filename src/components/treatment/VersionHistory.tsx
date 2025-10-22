import React from 'react';
import { useTreatmentStore } from '../../store/treatmentStore';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Clock, RotateCcw, Save } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export function VersionHistory() {
  const { currentTreatment, saveVersion, loadVersion } = useTreatmentStore();
  const [open, setOpen] = React.useState(false);

  if (!currentTreatment) return null;

  const handleSaveVersion = () => {
    saveVersion();
  };

  const handleLoadVersion = (versionId: string) => {
    if (confirm('Load this version? Current changes will be saved as a new version.')) {
      saveVersion(); // Save current state first
      loadVersion(versionId);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" />
          Versions ({currentTreatment.versions.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            View and restore previous versions of this treatment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Button onClick={handleSaveVersion} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Save Current Version
          </Button>

          <div className="space-y-2">
            {currentTreatment.versions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No saved versions yet. Click "Save Current Version" to create one.
              </p>
            ) : (
              currentTreatment.versions
                .slice()
                .reverse()
                .map((version, index) => (
                  <Card key={version.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          Version {currentTreatment.versions.length - index}
                        </h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(version.timestamp)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {version.chapters.length} chapters
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoadVersion(version.id)}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restore
                      </Button>
                    </div>
                  </Card>
                ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

