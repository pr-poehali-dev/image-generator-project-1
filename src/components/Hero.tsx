import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

export default function Hero() {
  const scrollToGenerator = () => {
    document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-6xl mx-auto text-center space-y-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-scale-in">
          <Icon name="Sparkles" className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Powered by AI</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
          <span className="text-gradient">Генератор</span>
          <br />
          Изображений
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          Превратите идеи в визуальные шедевры с помощью искусственного интеллекта. 
          Создавайте, редактируйте и улучшайте изображения мгновенно.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 border-gradient bg-primary hover:bg-primary/90 group"
            onClick={scrollToGenerator}
          >
            Начать создавать
            <Icon name="ArrowRight" className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-6 border-gradient bg-transparent"
            onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Icon name="Image" className="mr-2 w-5 h-5" />
            Смотреть галерею
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
          <div className="space-y-2">
            <div className="text-4xl font-bold text-gradient">10K+</div>
            <div className="text-sm text-muted-foreground">Изображений создано</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-gradient">AI</div>
            <div className="text-sm text-muted-foreground">Нейросеть</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-gradient">∞</div>
            <div className="text-sm text-muted-foreground">Возможностей</div>
          </div>
        </div>
      </div>
    </section>
  );
}
