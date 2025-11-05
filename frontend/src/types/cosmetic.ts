export type CosmeticRarity = 'common'|'uncommon'|'rare'|'epic'|'legendary'|'mythic'|'gaminglegends'|string;
export type CosmeticType = 'outfit'|'backpack'|'pickaxe'|'glider'|'emote'|string;

export interface Cosmetic {
  id: string;
  name: string;
  description?: string | null;
  type?: { value: CosmeticType; displayValue?: string };
  rarity?: { value: CosmeticRarity; displayValue?: string };
  images?: {
    smallIcon?: string;
    icon?: string;
  };
  added?: string; // ISO date
  series?: { value?: string };
  set?: { value?: string };
  price?: number; // não vem da API; só usaremos depois
}
