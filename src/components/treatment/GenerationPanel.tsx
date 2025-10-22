import { useTreatmentStore } from '../../store/treatmentStore';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import type { ToneType, GenreType } from '../../types/treatment';

const TONES: ToneType[] = ['DIRECT', 'CONVERSATIONAL', 'FUNNY', 'POETIC'];
const GENRES: GenreType[] = [
  'CARS', 'TECH', 'SPORTS', 'FASHION', 'BEAUTY', 
  'LIFESTYLE', 'FOOD', 'TRAVEL', 'LUXURY', 'HEALTHCARE', 'FINANCE', 'OTHER'
];

export function GenerationPanel() {
  const { currentTreatment, updateSettings } = useTreatmentStore();

  if (!currentTreatment) return null;

  const { settings } = currentTreatment;

  return (
    <div className="w-80 h-full overflow-y-auto border-l bg-background">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Treatment Settings</h2>
        </div>

        <Tabs defaultValue="style" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone of Voice</Label>
              <Select
                value={settings.tone}
                onValueChange={(value: ToneType) => updateSettings({ tone: value })}
              >
                <SelectTrigger id="tone">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map(tone => (
                    <SelectItem key={tone} value={tone}>
                      {tone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre/Channel</Label>
              <Select
                value={settings.genre}
                onValueChange={(value: GenreType) => updateSettings({ genre: value })}
              >
                <SelectTrigger id="genre">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map(genre => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="styleEmulation">Style Emulation</Label>
              <Textarea
                id="styleEmulation"
                placeholder="Paste a writing sample to emulate the style..."
                value={settings.styleEmulation || ''}
                onChange={(e) => updateSettings({ styleEmulation: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="naturalize">Natural Language Filter</Label>
              <Switch
                id="naturalize"
                checked={settings.naturalizeText}
                onCheckedChange={(checked) => updateSettings({ naturalizeText: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="topline">Topline Mode</Label>
              <Switch
                id="topline"
                checked={settings.toplineMode}
                onCheckedChange={(checked) => updateSettings({ toplineMode: checked })}
              />
            </div>

            <div className="space-y-3 pt-2">
              <Label>Creative Modes</Label>
              <div className="flex items-center justify-between">
                <Label htmlFor="tighten" className="font-normal">Tighten</Label>
                <Switch
                  id="tighten"
                  checked={settings.creativeModes.tighten}
                  onCheckedChange={(checked) => 
                    updateSettings({ 
                      creativeModes: { ...settings.creativeModes, tighten: checked } 
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="quips" className="font-normal">Quips</Label>
                <Switch
                  id="quips"
                  checked={settings.creativeModes.quips}
                  onCheckedChange={(checked) => 
                    updateSettings({ 
                      creativeModes: { ...settings.creativeModes, quips: checked } 
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="curveball" className="font-normal">Curveball</Label>
                <Switch
                  id="curveball"
                  checked={settings.creativeModes.curveball}
                  onCheckedChange={(checked) => 
                    updateSettings({ 
                      creativeModes: { ...settings.creativeModes, curveball: checked } 
                    })
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inputs" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="brief">Creative Brief</Label>
              <Textarea
                id="brief"
                placeholder="Paste the creative brief..."
                value={settings.brief || ''}
                onChange={(e) => updateSettings({ brief: e.target.value })}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Director's Notes</Label>
              <Textarea
                id="notes"
                placeholder="Your notes, ideas, or dictation..."
                value={settings.notes || ''}
                onChange={(e) => updateSettings({ notes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chemistryNotes">Chemistry Call Notes</Label>
              <Textarea
                id="chemistryNotes"
                placeholder="Notes from chemistry call..."
                value={settings.chemistryCallNotes || ''}
                onChange={(e) => updateSettings({ chemistryCallNotes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reelLinks">Director's Reel Links</Label>
              <Textarea
                id="reelLinks"
                placeholder="Paste Vimeo/YouTube links (one per line)..."
                value={settings.reelLinks.join('\n')}
                onChange={(e) => 
                  updateSettings({ 
                    reelLinks: e.target.value.split('\n').filter(l => l.trim()) 
                  })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalPrompts">Additional Prompts</Label>
              <Textarea
                id="additionalPrompts"
                placeholder="Any special instructions..."
                value={settings.additionalPrompts || ''}
                onChange={(e) => updateSettings({ additionalPrompts: e.target.value })}
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="scriptIdeas">Script Ideas</Label>
              <Switch
                id="scriptIdeas"
                checked={settings.enableScriptIdeas}
                onCheckedChange={(checked) => updateSettings({ enableScriptIdeas: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="characterBios">Character Biographies</Label>
              <Switch
                id="characterBios"
                checked={settings.enableCharacterBios}
                onCheckedChange={(checked) => updateSettings({ enableCharacterBios: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="references">Film/TV References</Label>
              <Switch
                id="references"
                checked={settings.enableReferences}
                onCheckedChange={(checked) => updateSettings({ enableReferences: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="bonusOutputs">Bonus Outputs</Label>
              <Switch
                id="bonusOutputs"
                checked={settings.enableBonusOutputs}
                onCheckedChange={(checked) => updateSettings({ enableBonusOutputs: checked })}
              />
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Enable extended creative features to generate character bios, visual references,
                script variations, playlists, and more.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

