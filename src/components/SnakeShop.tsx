import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { toast } from "sonner";

const SHOP_API = "https://functions.poehali.dev/85bcafb3-5dbf-4499-9c79-8380334f4937";

interface Skin {
  id: number;
  name: string;
  description: string;
  price: number;
  head_color: string;
  body_color: string;
  emoji: string;
  is_premium: boolean;
}

interface PlayerData {
  player_id: string;
  coins: number;
  total_score: number;
  games_played: number;
  owned_skins: number[];
  active_skin: number;
}

interface Props {
  playerId: string;
  onBack: () => void;
  onSkinChange?: (skinId: number) => void;
}

export default function SnakeShop({ playerId, onBack, onSkinChange }: Props) {
  const [skins, setSkins] = useState<Skin[]>([]);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadShopData = async () => {
    setLoading(true);
    const response = await fetch(`${SHOP_API}?playerId=${playerId}`);
    const data = await response.json();
    setSkins(data.skins);
    setPlayerData(data.player);
    setLoading(false);
  };

  useEffect(() => {
    loadShopData();
  }, [playerId]);

  const purchaseSkin = async (skinId: number) => {
    const response = await fetch(SHOP_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "purchase", playerId, skinId }),
    });
    const result = await response.json();

    if (result.success) {
      toast.success("Скин куплен! 🎉");
      loadShopData();
    } else {
      toast.error(result.error || "Ошибка покупки");
    }
  };

  const activateSkin = async (skinId: number) => {
    const response = await fetch(SHOP_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "activate", playerId, skinId }),
    });
    const result = await response.json();

    if (result.success) {
      toast.success("Скин активирован! ✨");
      loadShopData();
      if (onSkinChange) {
        onSkinChange(skinId);
      }
    } else {
      toast.error(result.error || "Ошибка активации");
    }
  };

  const nextSkin = () => {
    setCurrentIndex((prev) => (prev + 1) % skins.length);
  };

  const prevSkin = () => {
    setCurrentIndex((prev) => (prev - 1 + skins.length) % skins.length);
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-pulse">Загрузка магазина...</div>
      </Card>
    );
  }

  const currentSkin = skins[currentIndex];
  const isOwned = playerData?.owned_skins.includes(currentSkin.id);
  const isActive = playerData?.active_skin === currentSkin.id;
  const canAfford = (playerData?.coins || 0) >= currentSkin.price;

  return (
    <div className="space-y-6">
      <Card className="p-6 border-gradient bg-gradient-to-b from-background to-muted/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-gradient">
              {playerData?.coins || 0} 🪙
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onBack}>
            <Icon name="X" className="w-5 h-5" />
          </Button>
        </div>

        <div className="relative">
          <div 
            className="absolute inset-0 -z-10 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="flex items-center justify-center gap-4 py-12">
            <button
              onClick={prevSkin}
              className="w-16 h-16 flex items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 transition-all hover:scale-110 shadow-lg"
            >
              <Icon name="ChevronLeft" className="w-8 h-8 text-white" />
            </button>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <div
                  className="w-full aspect-video rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  }}
                >
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundImage: 'radial-gradient(circle, rgba(80,80,100,0.3) 2px, transparent 2px)',
                      backgroundSize: '30px 30px',
                    }}
                  />

                  <div className="relative flex items-center justify-center gap-2">
                    <div
                      className="w-16 h-16 rounded-full animate-pulse"
                      style={{
                        background: `radial-gradient(circle, ${currentSkin.head_color}, ${currentSkin.body_color})`,
                        boxShadow: `0 0 40px ${currentSkin.head_color}80`,
                      }}
                    />
                    <div
                      className="w-14 h-14 rounded-full"
                      style={{
                        background: currentSkin.body_color,
                        boxShadow: `0 0 30px ${currentSkin.body_color}60`,
                      }}
                    />
                    <div
                      className="w-12 h-12 rounded-full"
                      style={{
                        background: currentSkin.body_color,
                        boxShadow: `0 0 20px ${currentSkin.body_color}40`,
                      }}
                    />
                  </div>

                  {isActive && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-semibold flex items-center gap-1 shadow-lg">
                      <Icon name="Check" className="w-3 h-3" />
                      Активен
                    </div>
                  )}
                </div>

                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {skins.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentIndex
                          ? 'bg-primary w-8'
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="text-center mt-8 space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-3xl font-bold text-gradient">
                    {currentSkin.name}
                  </h2>
                  {currentSkin.is_premium && (
                    <span className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold shadow-lg">
                      Premium
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground">
                  {currentSkin.description}
                </p>

                <div className="text-2xl font-bold text-primary">
                  {currentSkin.price === 0 ? "Бесплатно" : `${currentSkin.price} 🪙`}
                </div>

                <div className="pt-4">
                  {isActive ? (
                    <div className="py-3 px-6 rounded-full bg-green-500/20 border-2 border-green-500 text-green-500 font-semibold inline-flex items-center gap-2">
                      <Icon name="Check" className="w-5 h-5" />
                      Экипирован
                    </div>
                  ) : isOwned ? (
                    <Button
                      size="lg"
                      onClick={() => activateSkin(currentSkin.id)}
                      className="px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg text-lg"
                    >
                      Надеть
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => purchaseSkin(currentSkin.id)}
                      disabled={!canAfford}
                      className="px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 shadow-lg text-lg"
                    >
                      {canAfford ? "Купить" : "Недостаточно монет"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={nextSkin}
              className="w-16 h-16 flex items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 transition-all hover:scale-110 shadow-lg"
            >
              <Icon name="ChevronRight" className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-gradient">
              {playerData?.games_played || 0}
            </div>
            <div className="text-xs text-muted-foreground">Игр сыграно</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gradient">
              {playerData?.total_score || 0}
            </div>
            <div className="text-xs text-muted-foreground">Общий счёт</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gradient">
              {playerData?.owned_skins.length || 0}/{skins.length}
            </div>
            <div className="text-xs text-muted-foreground">Скинов куплено</div>
          </div>
        </div>
      </Card>

      <Card className="p-4 border-gradient bg-muted/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Icon name="Info" className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Как получить монеты?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Играйте и зарабатывайте: 1 очко = 1 монета</li>
              <li>• Собирайте еду и конфеты для большего счёта</li>
              <li>• Используйте бонусы для удвоения и утроения очков</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
