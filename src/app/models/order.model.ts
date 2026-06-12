export interface OrderLine {
  id_com: number;
  qty: number;
  date_com: string;
  jeu_titre: string;
  jeu_prix: number;
  total_ligne: number;
  image_url?: string;  // historique utilisateur
  user_nom?: string;   // affichage côté Admin (getAllOrders)
  user_email?: string; // affichage côté Admin (getAllOrders)
}