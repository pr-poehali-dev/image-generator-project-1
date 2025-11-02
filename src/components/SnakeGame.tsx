import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Candy = {
  position: Position;
  type: "speed" | "slow" | "invert" | "double" | "shrink";
  emoji: string;
  color: string;
};

const CANDY_TYPES = [
  { type: "speed" as const, emoji: "⚡", color: "#F97316", name: "Ускорение" },
  { type: "slow" as const, emoji: "🐌", color: "#8B5CF6", name: "Замедление" },
  { type: "invert" as const, emoji: "🔄", color: "#0EA5E9", name: "Инверсия" },
  { type: "double" as const, emoji: "💎", color: "#D946EF", name: "Двойные очки" },
  { type: "shrink" as const, emoji: "✂️", color: "#10B981", name: "Укорочение" },
];

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [candy, setCandy] = useState<Candy | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [isInverted, setIsInverted] = useState(false);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);

  const directionRef = useRef(direction);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const generateRandomPosition = useCallback(() => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }, []);

  const generateCandy = useCallback(() => {
    if (Math.random() > 0.7) {
      const candyType = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
      setCandy({
        position: generateRandomPosition(),
        type: candyType.type,
        emoji: candyType.emoji,
        color: candyType.color,
      });
    }
  }, [generateRandomPosition]);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection("RIGHT");
    setFood(generateRandomPosition());
    setCandy(null);
    setScore(0);
    setGameOver(false);
    setSpeed(INITIAL_SPEED);
    setActiveEffect(null);
    setIsInverted(false);
    setScoreMultiplier(1);
  }, [generateRandomPosition]);

  const applyEffect = useCallback((type: Candy["type"]) => {
    const candyInfo = CANDY_TYPES.find((c) => c.type === type);
    if (candyInfo) {
      toast.success(`Бонус: ${candyInfo.name}!`, {
        icon: candyInfo.emoji,
      });
    }

    setActiveEffect(type);

    switch (type) {
      case "speed":
        setSpeed((s) => Math.max(50, s - 50));
        setTimeout(() => {
          setSpeed(INITIAL_SPEED);
          setActiveEffect(null);
        }, 5000);
        break;
      case "slow":
        setSpeed((s) => s + 50);
        setTimeout(() => {
          setSpeed(INITIAL_SPEED);
          setActiveEffect(null);
        }, 5000);
        break;
      case "invert":
        setIsInverted(true);
        setTimeout(() => {
          setIsInverted(false);
          setActiveEffect(null);
        }, 5000);
        break;
      case "double":
        setScoreMultiplier(2);
        setTimeout(() => {
          setScoreMultiplier(1);
          setActiveEffect(null);
        }, 10000);
        break;
      case "shrink":
        setSnake((s) => s.slice(0, Math.max(1, Math.floor(s.length / 2))));
        setActiveEffect(null);
        break;
    }
  }, []);

  const moveSnake = useCallback(() => {
    if (!isPlayingRef.current) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const dir = directionRef.current;
      let newHead: Position;

      switch (dir) {
        case "UP":
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case "DOWN":
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case "LEFT":
          newHead = { x: head.x - 1, y: head.y };
          break;
        case "RIGHT":
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE ||
        prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setGameOver(true);
        setIsPlaying(false);
        if (score > highScore) {
          setHighScore(score);
          toast.success("Новый рекорд! 🏆");
        }
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + (10 * scoreMultiplier));
        setFood(generateRandomPosition());
        generateCandy();
        return newSnake;
      }

      if (candy && newHead.x === candy.position.x && newHead.y === candy.position.y) {
        applyEffect(candy.type);
        setCandy(null);
        return newSnake;
      }

      newSnake.pop();
      return newSnake;
    });
  }, [food, candy, score, highScore, generateRandomPosition, generateCandy, applyEffect, scoreMultiplier]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed, moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlayingRef.current) return;

      const keyMap: Record<string, Direction> = {
        ArrowUp: "UP",
        ArrowDown: "DOWN",
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        w: "UP",
        s: "DOWN",
        a: "LEFT",
        d: "RIGHT",
      };

      let newDirection = keyMap[e.key];
      if (!newDirection) return;

      if (isInverted) {
        const invertMap: Record<Direction, Direction> = {
          UP: "DOWN",
          DOWN: "UP",
          LEFT: "RIGHT",
          RIGHT: "LEFT",
        };
        newDirection = invertMap[newDirection];
      }

      const currentDir = directionRef.current;
      const opposites: Record<Direction, Direction> = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      };

      if (newDirection !== opposites[currentDir]) {
        setDirection(newDirection);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isInverted]);

  const startGame = () => {
    resetGame();
    setIsPlaying(true);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-gradient">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <div className="text-3xl font-bold text-gradient">
              {score}
            </div>
            <div className="text-xs text-muted-foreground">
              Рекорд: {highScore}
            </div>
          </div>

          <div className="flex gap-2">
            {!isPlaying && !gameOver && (
              <Button onClick={startGame} className="bg-primary">
                <Icon name="Play" className="w-4 h-4 mr-2" />
                Старт
              </Button>
            )}
            {gameOver && (
              <Button onClick={startGame} className="bg-primary">
                <Icon name="RotateCcw" className="w-4 h-4 mr-2" />
                Заново
              </Button>
            )}
            {isPlaying && (
              <Button
                variant="outline"
                onClick={() => setIsPlaying(false)}
                className="border-gradient"
              >
                <Icon name="Pause" className="w-4 h-4 mr-2" />
                Пауза
              </Button>
            )}
          </div>
        </div>

        {activeEffect && (
          <div className="mb-4 p-2 rounded-lg bg-primary/20 text-sm text-center animate-fade-in">
            {CANDY_TYPES.find((c) => c.type === activeEffect)?.emoji} Активен эффект:{" "}
            {CANDY_TYPES.find((c) => c.type === activeEffect)?.name}
          </div>
        )}

        <div
          className="relative mx-auto bg-muted rounded-lg overflow-hidden"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
        >
          {snake.map((segment, index) => (
            <div
              key={index}
              className="absolute rounded-sm transition-all"
              style={{
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                background:
                  index === 0
                    ? "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))"
                    : "hsl(var(--accent))",
              }}
            />
          ))}

          <div
            className="absolute rounded-full animate-pulse"
            style={{
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              background: "#F97316",
            }}
          />

          {candy && (
            <div
              className="absolute flex items-center justify-center text-lg animate-scale-in"
              style={{
                left: candy.position.x * CELL_SIZE,
                top: candy.position.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
            >
              {candy.emoji}
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-background/90 flex items-center justify-center animate-fade-in">
              <div className="text-center space-y-2">
                <div className="text-4xl">💀</div>
                <div className="text-xl font-bold">Игра окончена!</div>
                <div className="text-muted-foreground">Счёт: {score}</div>
              </div>
            </div>
          )}

          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 bg-background/90 flex items-center justify-center">
              <div className="text-center space-y-2 text-muted-foreground">
                <Icon name="Gamepad2" className="w-12 h-12 mx-auto" />
                <div className="text-sm">Нажмите Старт</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          Управление: ← ↑ → ↓ или WASD
        </div>
      </Card>

      <Card className="p-4 border-gradient">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Icon name="Sparkles" className="w-4 h-4 text-primary" />
          Бонусы
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {CANDY_TYPES.map((candyType) => (
            <div
              key={candyType.type}
              className="flex items-center gap-2 p-2 rounded bg-muted/50 text-xs"
            >
              <span className="text-base">{candyType.emoji}</span>
              <span>{candyType.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
