import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

export default function Generator() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Введите описание изображения");
      return;
    }

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setGeneratedImage(`https://picsum.photos/seed/${Date.now()}/800/600`);
      toast.success("Изображение создано!");
    } catch (error) {
      toast.error("Ошибка генерации");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhance = () => {
    toast.success("Изображение улучшено!");
  };

  return (
    <section id="generator" className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <h2 className="text-5xl font-bold">
            <span className="text-gradient">AI Генератор</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Опишите то, что хотите увидеть, и нейросеть создаст это для вас
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="p-6 space-y-6 border-gradient animate-scale-in">
            <div className="space-y-4">
              <label className="text-sm font-medium flex items-center gap-2">
                <Icon name="Wand2" className="w-4 h-4 text-primary" />
                Описание изображения
              </label>
              <Textarea
                placeholder="Например: футуристический город с неоновыми огнями, киберпанк стиль, высокая детализация"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[200px] resize-none bg-background/50"
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
              >
                {isGenerating ? (
                  <>
                    <Icon name="Loader2" className="mr-2 w-5 h-5 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Icon name="Sparkles" className="mr-2 w-5 h-5" />
                    Сгенерировать
                  </>
                )}
              </Button>

              {generatedImage && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleEnhance}
                    className="flex-1 border-gradient"
                  >
                    <Icon name="Wand2" className="mr-2 w-4 h-4" />
                    Улучшить
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = generatedImage;
                      link.download = 'generated-image.jpg';
                      link.click();
                      toast.success("Загрузка начата!");
                    }}
                    className="flex-1 border-gradient"
                  >
                    <Icon name="Download" className="mr-2 w-4 h-4" />
                    Скачать
                  </Button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Info" className="w-4 h-4" />
                <span>Чем детальнее описание, тем лучше результат</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-gradient animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Icon name="Image" className="w-5 h-5 text-primary" />
                  Результат
                </h3>
                {generatedImage && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                    Готово
                  </span>
                )}
              </div>

              <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                {generatedImage ? (
                  <img 
                    src={generatedImage} 
                    alt="Generated" 
                    className="w-full h-full object-cover animate-fade-in"
                  />
                ) : (
                  <div className="text-center space-y-3 p-8">
                    <Icon name="ImagePlus" className="w-16 h-16 mx-auto text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      Здесь появится сгенерированное изображение
                    </p>
                  </div>
                )}
              </div>

              {generatedImage && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Размер:</span>
                    <span className="font-medium">800 × 600 px</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Формат:</span>
                    <span className="font-medium">JPEG</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
