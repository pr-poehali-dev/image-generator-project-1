import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Generator from "@/components/Generator";
import Gallery from "@/components/Gallery";

export default function Index() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <Hero />
        <Generator />
        <Gallery />
      </main>
      
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-xl font-bold">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white">✨</span>
            </div>
            <span className="text-gradient">AI Gallery</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Создавайте уникальные изображения с помощью искусственного интеллекта
          </p>
          <div className="text-xs text-muted-foreground">
            © 2024 AI Gallery. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}
