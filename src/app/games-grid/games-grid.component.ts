import { Component, OnInit } from '@angular/core';

export interface Game {
  id_jeu: number;
  titre: string;
  image_url: string;
  categories_noms?: string;
  prix: number;
  ancien_prix?: number;
  stock?: number;
  nouveau?: boolean;
}

@Component({
  selector: 'app-games-grid',
  templateUrl: './games-grid.component.html',
  styleUrls: ['../app.component.css']
})
export class GamesGridComponent implements OnInit {
// Le tableau qui contiendra tes jeux
  jeux: Game[] = [];

  constructor() {}

  ngOnInit(): void {
    // Simulation des données (à remplacer par un appel API vers ton backend)
    this.jeux = [
      {
        id_jeu: 1,
        titre: 'The Legend of Zelda',
        image_url: 'https://cdn.gamekult.com/optim/images/gallery/34/348773/the-legend-of-zelda-tears-of-the-kingdom-switch-b5227576__w1280.png',
        categories_noms: 'Action / Aventure',
        prix: 59.99,
        stock: 3,
        nouveau: true
      },
      {
        id_jeu: 2,
        titre: 'Cyberpunk 2077',
        image_url: 'https://cdn.dlcompare.com/game_tetiere/upload/gameimage/file/37703.jpeg.webp',
        prix: 29.99,
        ancien_prix: 59.99,
        stock: 15
      }
    ];
  }

  // Méthode pour le bouton "Ajouter"
  addToCart(jeu: Game): void {
    console.log('Jeu ajouté au panier :', jeu.titre);
    // Logique d'ajout au panier...
  }

  // Méthode pour la pagination
  changePage(page: number): void {
    console.log('Changement vers la page :', page);
    // Logique de changement de page...
  }
}
