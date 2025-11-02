import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

export default function Navigation() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-xl font-bold group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="Sparkles" className="w-5 h-5 text-white" />
            </div>
            <span className="text-gradient">AI Gallery</span>
          </button>

          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Главная
            </button>
            <button 
              onClick={() => scrollToSection('generator')}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Генератор
            </button>
            <button 
              onClick={() => scrollToSection('gallery')}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Галерея
            </button>
          </div>

          <Button 
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={() => scrollToSection('generator')}
          >
            <Icon name="Plus" className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Создать</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
