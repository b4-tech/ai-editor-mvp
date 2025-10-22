import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface DiffViewerProps {
  oldText: string;
  newText: string;
  title?: string;
}

export function DiffViewer({ oldText, newText, title }: DiffViewerProps) {
  // Simple word-level diff
  const oldWords = oldText.split(/\s+/);
  const newWords = newText.split(/\s+/);
  
  const maxLength = Math.max(oldWords.length, newWords.length);
  
  const changes: Array<{ type: 'added' | 'removed' | 'unchanged', word: string }> = [];
  
  // Very basic diff - in production, use a proper diff algorithm
  for (let i = 0; i < maxLength; i++) {
    if (i >= oldWords.length) {
      changes.push({ type: 'added', word: newWords[i] });
    } else if (i >= newWords.length) {
      changes.push({ type: 'removed', word: oldWords[i] });
    } else if (oldWords[i] === newWords[i]) {
      changes.push({ type: 'unchanged', word: oldWords[i] });
    } else {
      changes.push({ type: 'removed', word: oldWords[i] });
      changes.push({ type: 'added', word: newWords[i] });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'Changes'}</CardTitle>
        <CardDescription>
          Comparing old version with current version
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4 text-xs mb-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500/20 border border-green-500 rounded" />
              <span>Added</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500/20 border border-red-500 rounded" />
              <span>Removed</span>
            </div>
          </div>
          
          <div className="p-4 bg-muted rounded-md text-sm leading-relaxed">
            {changes.map((change, index) => (
              <span
                key={index}
                className={
                  change.type === 'added'
                    ? 'bg-green-500/20 border-green-500 px-1 rounded'
                    : change.type === 'removed'
                    ? 'bg-red-500/20 border-red-500 px-1 rounded line-through'
                    : ''
                }
              >
                {change.word}{' '}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

