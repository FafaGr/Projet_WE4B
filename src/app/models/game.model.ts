export interface Game {
  id_jeu?: number;
  titre: string;
  description: string;
  prix: number;
  ancien_prix?: number | null;
  stock: number;
  image_url: string;
  nouveau: boolean | number;
  note?: number;
  categories_noms?: string;
}

export interface GameFilters {
  platform?: 'PC' | 'Console' | null;
  category?: number;
  search?: string;
  sort?: 'price-asc' | 'price-desc' | 'news';
}
