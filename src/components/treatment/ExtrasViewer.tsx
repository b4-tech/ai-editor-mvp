import React, { useState } from 'react';
import { useTreatmentStore } from '../../store/treatmentStore';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Sparkles, User, Film, FileText, Gift, Loader2 } from 'lucide-react';
import { generateExtras } from '../../lib/treatmentGenerator';

export function ExtrasViewer() {
  const { currentTreatment, generatedExtras, setGeneratedExtras } = useTreatmentStore();
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!currentTreatment) return null;

  const handleGenerateExtras = async () => {
    setIsGenerating(true);
    try {
      const extras = await generateExtras(
        currentTreatment.settings,
        undefined,
        currentTreatment.id
      );
      setGeneratedExtras(extras);
    } catch (error) {
      console.error('Error generating extras:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasAnyExtrasEnabled = 
    currentTreatment.settings.enableCharacterBios ||
    currentTreatment.settings.enableReferences ||
    currentTreatment.settings.enableScriptIdeas ||
    currentTreatment.settings.enableBonusOutputs;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Extras
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Creative Extras</DialogTitle>
          <DialogDescription>
            Additional creative materials generated for your treatment
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {!hasAnyExtrasEnabled ? (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Enable extras features in the settings panel to generate creative supplements
              </p>
            </div>
          ) : !generatedExtras ? (
            <div className="text-center py-8 space-y-4">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Generate creative extras based on your treatment settings
              </p>
              <Button onClick={handleGenerateExtras} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Extras
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="characters" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="characters">Characters</TabsTrigger>
                <TabsTrigger value="references">References</TabsTrigger>
                <TabsTrigger value="scripts">Scripts</TabsTrigger>
                <TabsTrigger value="bonus">Bonus</TabsTrigger>
              </TabsList>

              <TabsContent value="characters" className="space-y-4 mt-4">
                {generatedExtras.characterBios && generatedExtras.characterBios.length > 0 ? (
                  generatedExtras.characterBios.map((bio, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {bio.name}
                        </CardTitle>
                        <CardDescription>{bio.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {bio.traits.length > 0 && (
                          <div className="mb-3">
                            <h4 className="font-medium text-sm mb-2">Key Traits</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {bio.traits.map((trait, i) => (
                                <li key={i} className="text-sm text-muted-foreground">{trait}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {bio.background && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Background</h4>
                            <p className="text-sm text-muted-foreground">{bio.background}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No character bios generated</p>
                )}
              </TabsContent>

              <TabsContent value="references" className="space-y-4 mt-4">
                {generatedExtras.references && generatedExtras.references.length > 0 ? (
                  generatedExtras.references.map((ref, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Film className="h-5 w-5" />
                          {ref.title}
                        </CardTitle>
                        <CardDescription className="uppercase text-xs">{ref.type}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{ref.rationale}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No references generated</p>
                )}
              </TabsContent>

              <TabsContent value="scripts" className="space-y-4 mt-4">
                {generatedExtras.scriptIdeas && generatedExtras.scriptIdeas.length > 0 ? (
                  generatedExtras.scriptIdeas.map((idea, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Scene {idea.sceneNumber}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm">{idea.description}</p>
                        {idea.dialogue && (
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm italic">"{idea.dialogue}"</p>
                          </div>
                        )}
                        {idea.alternativeApproach && (
                          <div>
                            <h4 className="font-medium text-sm mb-1">Alternative Approach</h4>
                            <p className="text-sm text-muted-foreground">{idea.alternativeApproach}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No script ideas generated</p>
                )}
              </TabsContent>

              <TabsContent value="bonus" className="space-y-4 mt-4">
                {generatedExtras.bonusOutputs && generatedExtras.bonusOutputs.length > 0 ? (
                  generatedExtras.bonusOutputs.map((bonus, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Gift className="h-5 w-5" />
                          {bonus.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {bonus.items.map((item, i) => (
                            <li key={i} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No bonus outputs generated</p>
                )}
              </TabsContent>
            </Tabs>
          )}

          {generatedExtras && hasAnyExtrasEnabled && (
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" onClick={handleGenerateExtras} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Regenerate Extras
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

