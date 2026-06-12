import { Component, OnInit } from '@angular/core';
  // On définit la structure d'une catégorie (bonne pratique TypeScript)
  export interface Category {
    id_cat: number;
    libelle: string;
}

@Component({
  selector: 'app-filter-sec',
  templateUrl: './filter-sec.component.html',
  styleUrls: ['../../app.component.css']
})
export class FilterSecComponent implements OnInit {
  // Vos variables de recherche et de filtres (le fameux Data Binding bidirectionnel)
    searchTerm: string = '';
    selectedCategoryId: number = 0; // Équivalent de votre $cat_id en PHP
    selectedSort: string = 'news';
  // Votre liste de catégories (remplace ce que faisait votre base de données via PHP)
    categories: Category[] = [];
    constructor() { }
  ngOnInit(): void {
    // Ici, plus tard, vous ferez un appel API pour récupérer vos vraies catégories.
    // Pour l'exemple, on simule des données :
    this.categories = [
      { id_cat: 1, libelle: 'Action' },
      { id_cat: 2, libelle: 'Aventure' },
      { id_cat: 3, libelle: 'RPG' }
    ];
  }
  // Fonction appelée quand on clique sur la loupe (ou qu'on change un filtre)
  onSearch(): void {
    console.log('Recherche:', this.searchTerm);
    console.log('Catégorie:', this.selectedCategoryId);
    console.log('Tri:', this.selectedSort);
    // Logique pour filtrer vos jeux ici...
  }
}
