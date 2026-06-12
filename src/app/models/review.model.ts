export interface Review {
  id_avis?: number;
  id_utilisateur: number;
  id_jeu: number;
  com: string;
  note: number;
  nom?: string;
}