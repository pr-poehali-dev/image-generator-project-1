import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";
import SnakeMultiplayer from "@/components/SnakeMultiplayer";
import SnakeShop from "@/components/SnakeShop";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 250;
const MIN_SPEED = 80;
const SPEED_DECREASE = 5;
const SAFE_MARGIN = 2;

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type CandyEffectType = "speed" | "slow" | "invert" | "double" | "shrink" | "ghost" | "freeze" | "magnet" | "rainbow" | "chaos";

type Candy = {
  position: Position;
  type: CandyEffectType;
  emoji: string;
  color: string;
};

const CANDY_TYPES = [
  { type: "speed" as const, emoji: "⚡", color: "#F97316", name: "Ускорение" },
  { type: "slow" as const, emoji: "🐌", color: "#8B5CF6", name: "Замедление" },
  { type: "invert" as const, emoji: "🔄", color: "#0EA5E9", name: "Инверсия" },
  { type: "double" as const, emoji: "💎", color: "#D946EF", name: "Двойные очки" },
  { type: "shrink" as const, emoji: "✂️", color: "#10B981", name: "Укорочение" },
  { type: "ghost" as const, emoji: "👻", color: "#A855F7", name: "Призрак" },
  { type: "freeze" as const, emoji: "❄️", color: "#06B6D4", name: "Заморозка" },
  { type: "magnet" as const, emoji: "🧲", color: "#EF4444", name: "Магнит" },
  { type: "rainbow" as const, emoji: "🌈", color: "#EC4899", name: "Радуга" },
  { type: "chaos" as const, emoji: "🎲", color: "#FBBF24", name: "Хаос" },
];

export default function SnakeGame() {
  const [playerId] = useState(() => `player_${Date.now()}_${Math.random()}`);
  const [showShop, setShowShop] = useState(false);
  const [gameMode, setGameMode] = useState<"classic" | "multiplayer" | null>(null);
  const [controlMode, setControlMode] = useState<"keyboard" | "touch" | null>(null);
  const [activeSkin, setActiveSkin] = useState(1);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [candy, setCandy] = useState<Candy | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [baseSpeed, setBaseSpeed] = useState(INITIAL_SPEED);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [isInverted, setIsInverted] = useState(false);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [isGhost, setIsGhost] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [magnetActive, setMagnetActive] = useState(false);
  const [rainbowMode, setRainbowMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const directionRef = useRef(direction);
  const isPlayingRef = useRef(isPlaying);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const generateRandomPosition = useCallback(() => {
    return {
      x: SAFE_MARGIN + Math.floor(Math.random() * (GRID_SIZE - SAFE_MARGIN * 2)),
      y: SAFE_MARGIN + Math.floor(Math.random() * (GRID_SIZE - SAFE_MARGIN * 2)),
    };
  }, []);

  const generateCandy = useCallback(() => {
    if (Math.random() > 0.65) {
      const candyType = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)];
      const position = {
        x: SAFE_MARGIN + Math.floor(Math.random() * (GRID_SIZE - SAFE_MARGIN * 2)),
        y: SAFE_MARGIN + Math.floor(Math.random() * (GRID_SIZE - SAFE_MARGIN * 2)),
      };
      setCandy({
        position,
        type: candyType.type,
        emoji: "🍬",
        color: candyType.color,
      });
    }
  }, []);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection("RIGHT");
    setFood(generateRandomPosition());
    setCandy(null);
    setScore(0);
    setGameOver(false);
    setSpeed(INITIAL_SPEED);
    setBaseSpeed(INITIAL_SPEED);
    setActiveEffect(null);
    setIsInverted(false);
    setScoreMultiplier(1);
    setGameMode(null);
    setControlMode(null);
    setShowShop(false);
    setIsGhost(false);
    setIsFrozen(false);
    setMagnetActive(false);
    setRainbowMode(false);
  }, [generateRandomPosition]);

  const saveCoins = useCallback(async (finalScore: number) => {
    const coins = finalScore;
    await fetch("https://functions.poehali.dev/85bcafb3-5dbf-4499-9c79-8380334f4937", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addCoins", playerId, amount: coins, score: finalScore }),
    });
  }, [playerId]);

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
          setSpeed(baseSpeed);
          setActiveEffect(null);
        }, 5000);
        break;
      case "slow":
        setSpeed((s) => s + 50);
        setTimeout(() => {
          setSpeed(baseSpeed);
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
      case "ghost":
        setIsGhost(true);
        setTimeout(() => {
          setIsGhost(false);
          setActiveEffect(null);
        }, 8000);
        break;
      case "freeze":
        setIsFrozen(true);
        setTimeout(() => {
          setIsFrozen(false);
          setActiveEffect(null);
        }, 3000);
        break;
      case "magnet":
        setMagnetActive(true);
        setTimeout(() => {
          setMagnetActive(false);
          setActiveEffect(null);
        }, 7000);
        break;
      case "rainbow":
        setRainbowMode(true);
        setScoreMultiplier(3);
        setTimeout(() => {
          setRainbowMode(false);
          setScoreMultiplier(1);
          setActiveEffect(null);
        }, 8000);
        break;
      case "chaos":
        const effects = ["speed", "slow", "invert", "shrink"];
        const randomEffect = effects[Math.floor(Math.random() * effects.length)] as CandyEffectType;
        applyEffect(randomEffect);
        break;
    }
  }, [baseSpeed]);

  const moveSnake = useCallback(() => {
    if (!isPlayingRef.current || isFrozen) return;

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

      const hitWall = newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE;
      const hitSelf = prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y);

      if ((hitWall || hitSelf) && !isGhost) {
        setGameOver(true);
        setIsPlaying(false);
        saveCoins(score);
        if (score > highScore) {
          setHighScore(score);
          toast.success("Новый рекорд! 🏆");
        }
        return prevSnake;
      }

      if (isGhost && hitWall) {
        if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
        if (newHead.x >= GRID_SIZE) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
        if (newHead.y >= GRID_SIZE) newHead.y = 0;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + (10 * scoreMultiplier));
        setFood(generateRandomPosition());
        generateCandy();
        
        setBaseSpeed((currentSpeed) => {
          const newSpeed = Math.max(MIN_SPEED, currentSpeed - SPEED_DECREASE);
          if (!activeEffect || activeEffect === "double" || activeEffect === "shrink") {
            setSpeed(newSpeed);
          }
          return newSpeed;
        });
        
        return newSnake;
      }

      if (candy && newHead.x === candy.position.x && newHead.y === candy.position.y) {
        applyEffect(candy.type);
        setCandy(null);
        return newSnake;
      }

      if (magnetActive && candy) {
        const distance = Math.abs(newHead.x - candy.position.x) + Math.abs(newHead.y - candy.position.y);
        if (distance <= 3) {
          applyEffect(candy.type);
          setCandy(null);
          return newSnake;
        }
      }

      newSnake.pop();
      return newSnake;
    });
  }, [food, candy, score, highScore, generateRandomPosition, generateCandy, applyEffect, scoreMultiplier, isGhost, magnetActive, saveCoins]);

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

  const startGame = (mode: "keyboard" | "touch") => {
    setControlMode(mode);
    setSnake([{ x: 10, y: 10 }]);
    setDirection("RIGHT");
    setFood(generateRandomPosition());
    setCandy(null);
    setScore(0);
    setGameOver(false);
    setSpeed(INITIAL_SPEED);
    setBaseSpeed(INITIAL_SPEED);
    setActiveEffect(null);
    setIsInverted(false);
    setScoreMultiplier(1);
    setIsPlaying(true);
  };

  const handleDirectionChange = (newDir: Direction) => {
    if (!isPlayingRef.current) return;

    let finalDir = newDir;
    if (isInverted) {
      const invertMap: Record<Direction, Direction> = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      };
      finalDir = invertMap[newDir];
    }

    const currentDir = directionRef.current;
    const opposites: Record<Direction, Direction> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };

    if (finalDir !== opposites[currentDir]) {
      setDirection(finalDir);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (showShop) {
    return (
      <SnakeShop
        playerId={playerId}
        onBack={() => setShowShop(false)}
        onSkinChange={(skinId) => setActiveSkin(skinId)}
      />
    );
  }

  if (!gameMode) {
    return (
      <Card className="p-8 border-gradient text-center space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Выбери режим игры</h2>
          <p className="text-muted-foreground">Играй один или соревнуйся с другими!</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setGameMode("classic")}
            className="p-8 rounded-xl border-2 border-border hover:border-primary transition-all hover:scale-105 group bg-muted/50 hover:bg-primary/10"
          >
            <div className="space-y-3">
              <div className="text-5xl">🎮</div>
              <div className="text-xl font-bold">Классика</div>
              <div className="text-sm text-muted-foreground">Одиночная игра</div>
              <div className="text-xs text-muted-foreground mt-2">
                • Стандартное поле<br />
                • Стены смертельны<br />
                • Бонусы и рекорды
              </div>
            </div>
          </button>
          <button
            onClick={() => setGameMode("multiplayer")}
            className="p-8 rounded-xl border-2 border-border hover:border-primary transition-all hover:scale-105 group bg-muted/50 hover:bg-primary/10"
          >
            <div className="space-y-3">
              <div className="text-5xl">👥</div>
              <div className="text-xl font-bold">Мультиплеер</div>
              <div className="text-sm text-muted-foreground">Онлайн битва</div>
              <div className="text-xs text-muted-foreground mt-2">
                • Большое поле<br />
                • Телепорт через стены<br />
                • Игра с другими
              </div>
            </div>
          </button>
        </div>
        <Button
          onClick={() => setShowShop(true)}
          className="w-full bg-gradient-to-r from-primary to-secondary"
        >
          <Icon name="ShoppingBag" className="w-4 h-4 mr-2" />
          Магазин скинов
        </Button>
      </Card>
    );
  }

  if (gameMode === "multiplayer" && !controlMode) {
    return (
      <Card className="p-8 border-gradient text-center space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Выбери устройство</h2>
          <p className="text-muted-foreground">Как ты будешь управлять змейкой?</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setControlMode("keyboard")}
            className="p-8 rounded-xl border-2 border-border hover:border-primary transition-all hover:scale-105 group bg-muted/50 hover:bg-primary/10"
          >
            <div className="space-y-3">
              <div className="text-5xl">💻</div>
              <div className="text-xl font-bold">Компьютер</div>
              <div className="text-sm text-muted-foreground">Управление клавишами</div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <kbd className="px-2 py-1 bg-background rounded text-xs">↑</kbd>
                <kbd className="px-2 py-1 bg-background rounded text-xs">↓</kbd>
                <kbd className="px-2 py-1 bg-background rounded text-xs">←</kbd>
                <kbd className="px-2 py-1 bg-background rounded text-xs">→</kbd>
              </div>
            </div>
          </button>
          <button
            onClick={() => setControlMode("touch")}
            className="p-8 rounded-xl border-2 border-border hover:border-primary transition-all hover:scale-105 group bg-muted/50 hover:bg-primary/10"
          >
            <div className="space-y-3">
              <div className="text-5xl">📱</div>
              <div className="text-xl font-bold">Телефон</div>
              <div className="text-sm text-muted-foreground">Управление кнопками</div>
              <div className="flex items-center justify-center gap-1 pt-2">
                <Icon name="ArrowUp" className="w-5 h-5 text-primary" />
                <Icon name="ArrowDown" className="w-5 h-5 text-primary" />
                <Icon name="ArrowLeft" className="w-5 h-5 text-primary" />
                <Icon name="ArrowRight" className="w-5 h-5 text-primary" />
              </div>
            </div>
          </button>
        </div>
      </Card>
    );
  }

  if (gameMode === "multiplayer" && controlMode) {
    return <SnakeMultiplayer controlMode={controlMode} onBack={resetGame} />;
  }

  if (!controlMode) {
    return (
      <Card className="p-8 border-gradient text-center space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Выбери устройство</h2>
          <p className="text-muted-foreground">Как ты будешь управлять змейкой?</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => startGame("keyboard")}
            className="p-8 rounded-xl border-2 border-border hover:border-primary transition-all hover:scale-105 group bg-muted/50 hover:bg-primary/10"
          >
            <div className="space-y-3">
              <div className="text-5xl">💻</div>
              <div className="text-xl font-bold">Компьютер</div>
              <div className="text-sm text-muted-foreground">Управление клавишами</div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <kbd className="px-2 py-1 bg-background rounded text-xs">↑</kbd>
                <kbd className="px-2 py-1 bg-background rounded text-xs">↓</kbd>
                <kbd className="px-2 py-1 bg-background rounded text-xs">←</kbd>
                <kbd className="px-2 py-1 bg-background rounded text-xs">→</kbd>
              </div>
            </div>
          </button>
          <button
            onClick={() => startGame("touch")}
            className="p-8 rounded-xl border-2 border-border hover:border-primary transition-all hover:scale-105 group bg-muted/50 hover:bg-primary/10"
          >
            <div className="space-y-3">
              <div className="text-5xl">📱</div>
              <div className="text-xl font-bold">Телефон</div>
              <div className="text-sm text-muted-foreground">Управление кнопками</div>
              <div className="flex items-center justify-center gap-1 pt-2">
                <Icon name="ArrowUp" className="w-5 h-5 text-primary" />
                <Icon name="ArrowDown" className="w-5 h-5 text-primary" />
                <Icon name="ArrowLeft" className="w-5 h-5 text-primary" />
                <Icon name="ArrowRight" className="w-5 h-5 text-primary" />
              </div>
            </div>
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div ref={containerRef} className={isFullscreen ? "fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4" : "space-y-6"}>
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center justify-center shadow-lg transition-all hover:scale-110"
          title="Закрыть полноэкранный режим"
        >
          <Icon name="X" className="w-5 h-5" />
        </button>
      )}

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
            {gameOver && (
              <Button onClick={() => startGame(controlMode)} className="bg-primary">
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
            {!isFullscreen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={resetGame}
                title="Сменить устройство"
              >
                <Icon name="Settings" className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {activeEffect && (
          <div 
            className="mb-4 p-3 rounded-lg text-sm text-center animate-fade-in font-semibold shadow-lg"
            style={{
              backgroundColor: CANDY_TYPES.find((c) => c.type === activeEffect)?.color + '20',
              borderLeft: `4px solid ${CANDY_TYPES.find((c) => c.type === activeEffect)?.color}`,
            }}
          >
            <span className="text-2xl mr-2">{CANDY_TYPES.find((c) => c.type === activeEffect)?.emoji}</span>
            Активен эффект: {CANDY_TYPES.find((c) => c.type === activeEffect)?.name}
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
              className={`absolute rounded-sm transition-all ${isGhost ? 'opacity-50' : ''} ${rainbowMode ? 'animate-pulse' : ''}`}
              style={{
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                background:
                  index === 0
                    ? rainbowMode
                      ? "linear-gradient(135deg, #FF0080, #FF8C00, #40E0D0, #FF1493)"
                      : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))"
                    : rainbowMode
                    ? `hsl(${(index * 30) % 360}, 80%, 60%)`
                    : "hsl(var(--accent))",
                boxShadow: isGhost ? '0 0 10px rgba(168, 85, 247, 0.5)' : rainbowMode ? '0 0 15px rgba(255, 0, 128, 0.7)' : 'none',
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
                filter: magnetActive ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.8))' : 'none',
              }}
            >
              <div
                className={magnetActive ? 'animate-bounce' : ''}
                style={{
                  fontSize: CELL_SIZE * 0.7,
                }}
              >
                {candy.emoji}
              </div>
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

        {controlMode === "keyboard" && (
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Управление: ← ↑ → ↓ или WASD
          </div>
        )}
      </Card>

      {controlMode === "touch" && isPlaying && (
        <Card className="p-6 border-gradient bg-gradient-to-br from-muted/30 to-muted/10">
          <div className="relative w-48 h-48 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-xl" />
            
            <div className="relative w-full h-full rounded-full bg-muted/80 backdrop-blur-sm border-4 border-primary/30 shadow-2xl flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 border-2 border-primary/50" />
              
              <button
                onClick={() => handleDirectionChange("UP")}
                className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-secondary shadow-lg active:scale-95 transition-all flex items-center justify-center border-2 border-white/20"
              >
                <Icon name="ChevronUp" className="w-7 h-7 text-white" />
              </button>
              
              <button
                onClick={() => handleDirectionChange("DOWN")}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-secondary shadow-lg active:scale-95 transition-all flex items-center justify-center border-2 border-white/20"
              >
                <Icon name="ChevronDown" className="w-7 h-7 text-white" />
              </button>
              
              <button
                onClick={() => handleDirectionChange("LEFT")}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-secondary shadow-lg active:scale-95 transition-all flex items-center justify-center border-2 border-white/20"
              >
                <Icon name="ChevronLeft" className="w-7 h-7 text-white" />
              </button>
              
              <button
                onClick={() => handleDirectionChange("RIGHT")}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-secondary shadow-lg active:scale-95 transition-all flex items-center justify-center border-2 border-white/20"
              >
                <Icon name="ChevronRight" className="w-7 h-7 text-white" />
              </button>
            </div>
          </div>
          
          <div className="text-center mt-4 text-xs text-muted-foreground">
            Используй джойстик для управления
          </div>
        </Card>
      )}

      {!isFullscreen && (
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
      )}
    </div>
  );
}