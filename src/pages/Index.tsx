import SnakeGame from "@/components/SnakeGame";
import Icon from "@/components/ui/icon";

export default function Index() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-2xl">🐍</span>
            </div>
            <h1 className="text-5xl font-bold text-gradient">Змейка</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Классическая игра с бонусами и случайными эффектами
          </p>
        </div>

        <SnakeGame />

        <div className="text-center space-y-4 pt-8">
          <h2 className="text-2xl font-bold">Как играть?</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="text-3xl">🎮</div>
              <div className="font-semibold">Управление</div>
              <div className="text-muted-foreground">
                Стрелки или WASD для движения змейки
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="text-3xl">🍎</div>
              <div className="font-semibold">Цель</div>
              <div className="text-muted-foreground">
                Собирай еду и расти, не врезайся в стены и себя
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="text-3xl">🍬</div>
              <div className="font-semibold">Бонусы</div>
              <div className="text-muted-foreground">
                Собирай конфеты для случайных эффектов
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Icon name="Gamepad2" className="w-4 h-4" />
            <span>Сделано с любовью к классике</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
