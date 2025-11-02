import { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

const CELL_SIZE = 15;
const API_URL = "https://functions.poehali.dev/8cd3b077-0cbd-4876-9e1c-e191a6d5f538";

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

interface Player {
  id: string;
  snake: Position[];
  direction: Direction;
  score: number;
  color: string;
  alive: boolean;
}

interface GameState {
  players: Player[];
  food: Position | null;
  started: boolean;
  gridSize: number;
}

interface Props {
  controlMode: "keyboard" | "touch";
  onBack: () => void;
}

export default function SnakeMultiplayer({ controlMode, onBack }: Props) {
  const [playerId] = useState(() => `player_${Date.now()}_${Math.random()}`);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myColor, setMyColor] = useState<string>("#F97316");
  const [isWaiting, setIsWaiting] = useState(true);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const directionRef = useRef(direction);
  const containerRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const joinGame = useCallback(async () => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", playerId }),
    });
    const data = await response.json();
    setMyColor(data.color);
    setIsWaiting(data.waiting);
  }, [playerId]);

  const sendDirection = useCallback(async (newDirection: Direction) => {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "move", playerId, direction: newDirection }),
    });
  }, [playerId]);

  const leaveGame = useCallback(async () => {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "leave", playerId }),
    });
  }, [playerId]);

  const pollGameState = useCallback(async () => {
    const response = await fetch(API_URL);
    const data: GameState = await response.json();
    setGameState(data);
    setIsWaiting(!data.started);
  }, []);

  useEffect(() => {
    joinGame();
    pollIntervalRef.current = setInterval(pollGameState, 100);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      leaveGame();
    };
  }, [joinGame, pollGameState, leaveGame]);

  const handleDirectionChange = useCallback((newDir: Direction) => {
    const opposites: Record<Direction, Direction> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };

    if (newDir !== opposites[directionRef.current]) {
      setDirection(newDir);
      sendDirection(newDir);
    }
  }, [sendDirection]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isWaiting) return;

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

      const newDirection = keyMap[e.key];
      if (newDirection) {
        handleDirectionChange(newDirection);
      }
    };

    if (controlMode === "keyboard") {
      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [controlMode, handleDirectionChange, isWaiting]);

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

  const myPlayer = gameState?.players.find((p) => p.id === playerId);
  const gridSize = gameState?.gridSize || 40;

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? "fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4"
          : "space-y-6"
      }
    >
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
              {myPlayer?.score || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Игроков: {gameState?.players.length || 0}
            </div>
          </div>

          <div className="flex gap-2">
            {!isFullscreen && (
              <Button variant="ghost" size="icon" onClick={onBack} title="Назад">
                <Icon name="ArrowLeft" className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {isWaiting && (
          <div className="mb-4 p-4 rounded-lg bg-primary/20 text-center animate-fade-in">
            <div className="text-lg font-semibold mb-2">⏳ Ожидание игроков...</div>
            <div className="text-sm text-muted-foreground">
              Нужно минимум 2 игрока для старта
            </div>
          </div>
        )}

        <div
          className="relative mx-auto bg-muted rounded-lg overflow-hidden"
          style={{
            width: gridSize * CELL_SIZE,
            height: gridSize * CELL_SIZE,
          }}
        >
          {gameState?.players.map((player) =>
            player.snake.map((segment, index) => (
              <div
                key={`${player.id}-${index}`}
                className="absolute rounded-sm transition-all"
                style={{
                  left: segment.x * CELL_SIZE,
                  top: segment.y * CELL_SIZE,
                  width: CELL_SIZE - 2,
                  height: CELL_SIZE - 2,
                  background:
                    index === 0
                      ? player.color
                      : `${player.color}80`,
                  opacity: player.alive ? 1 : 0.3,
                }}
              />
            ))
          )}

          {gameState?.food && (
            <div
              className="absolute rounded-full animate-pulse"
              style={{
                left: gameState.food.x * CELL_SIZE,
                top: gameState.food.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
                background: "#F97316",
              }}
            />
          )}
        </div>

        {controlMode === "keyboard" && (
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Управление: ← ↑ → ↓ или WASD
          </div>
        )}
      </Card>

      {controlMode === "touch" && !isWaiting && (
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
            <Icon name="Users" className="w-4 h-4 text-primary" />
            Игроки онлайн
          </h3>
          <div className="space-y-2">
            {gameState?.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 rounded bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: player.color }}
                  />
                  <span className="text-sm">
                    {player.id === playerId ? "Вы" : `Игрок ${player.id.slice(-4)}`}
                  </span>
                  {!player.alive && (
                    <span className="text-xs text-muted-foreground">💀</span>
                  )}
                </div>
                <div className="text-sm font-semibold">{player.score}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
