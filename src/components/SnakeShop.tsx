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

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-pulse">Загрузка магазина...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 border-gradient">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gradient">Магазин скинов</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Персонализируй свою змейку
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onBack}>
            <Icon name="X" className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 mb-6">
          <div className="flex-1">
            <div className="text-3xl font-bold text-gradient">
              {playerData?.coins || 0} 🪙
            </div>
            <div className="text-xs text-muted-foreground">
              Всего монет
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              Игр сыграно: {playerData?.games_played || 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Общий счёт: {playerData?.total_score || 0}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {skins.map((skin) => {
            const isOwned = playerData?.owned_skins.includes(skin.id);
            const isActive = playerData?.active_skin === skin.id;
            const canAfford = (playerData?.coins || 0) >= skin.price;

            return (
              <Card
                key={skin.id}
                className={`p-4 transition-all ${
                  isActive
                    ? "border-2 border-primary bg-primary/10"
                    : "border border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${skin.head_color}, ${skin.body_color})`,
                    }}
                  >
                    {skin.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{skin.name}</h3>
                      {skin.is_premium && (
                        <span className="text-xs px-2 py-0.5 rounded bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                          Premium
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {skin.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">
                        {skin.price === 0 ? "Бесплатно" : `${skin.price} 🪙`}
                      </div>
                      {isActive ? (
                        <div className="text-xs text-primary font-semibold flex items-center gap-1">
                          <Icon name="Check" className="w-3 h-3" />
                          Активен
                        </div>
                      ) : isOwned ? (
                        <Button
                          size="sm"
                          onClick={() => activateSkin(skin.id)}
                          className="h-7 text-xs"
                        >
                          Надеть
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => purchaseSkin(skin.id)}
                          disabled={!canAfford}
                          className="h-7 text-xs"
                        >
                          Купить
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      <Card className="p-4 border-gradient">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Icon name="Info" className="w-4 h-4 text-primary" />
          Как получить монеты?
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Играйте и зарабатывайте монеты за счёт</li>
          <li>• 1 очко = 1 монета</li>
          <li>• Собирайте еду и бонусы для большего счёта</li>
        </ul>
      </Card>
    </div>
  );
}
