import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GameService } from '../../services/game.service';
import { Game } from '../../models/game.model';

@Component({
  selector: 'app-admin-games',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-games.component.html',
})
export class AdminGamesComponent implements OnInit {
  games: Game[] = [];
  
  // Stockage des listes d'options de ton fichier SQL
  categories: any[] = [];
  plateformes: any[] = []; 
  
  loading = true;
  errorMsg = '';
  successMsg = '';
  search = '';

  editingId: number | null = null;
  editForm: any = {}; 
  saving = false;
  isCreating = false;

  // Tableaux temporaires pour stocker les sélections d'un ajout de jeu
  selectedCategories: number[] = [];
  selectedPlateformes: number[] = [];

  constructor(
    private gameService: GameService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    // Correspondance exacte avec le dump SQL de ta table `categories`
    this.categories = [
      { id_cat: 1, libelle: 'RPG' },
      { id_cat: 2, libelle: 'OpenWorld' },
      { id_cat: 3, libelle: 'Action' },
      { id_cat: 4, libelle: 'Aventure' },
      { id_cat: 5, libelle: 'FPS' }
    ];

    // Correspondance exacte avec le dump SQL de ta table `plateforme`
    this.plateformes = [
      { id_plateforme: 1, nom_plateforme: 'PC' },
      { id_plateforme: 2, nom_plateforme: 'PS4' },
      { id_plateforme: 3, nom_plateforme: 'PS5' },
      { id_plateforme: 4, nom_plateforme: 'Xbox Series X' },
      { id_plateforme: 5, nom_plateforme: 'Nintendo Switch' }
    ];

    this.loadGames();
  }

  loadGames(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.gameService.getAll().subscribe({
      next: (games) => {
        this.games = games;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Impossible de charger le catalogue. Vérifiez que l\'API est démarrée.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get filteredGames(): Game[] {
    if (!this.search.trim()) {
      return this.games;
    }
    const term = this.search.trim().toLowerCase();
    return this.games.filter(g => g.titre?.toLowerCase().includes(term));
  }

  // --- ACTIONS DE MODIFICATION ---
  startEdit(game: Game): void {
    this.cancelCreate();
    this.editingId = game.id_jeu ?? null;
    this.editForm = {
      titre: game.titre,
      description: game.description,
      image_url: game.image_url,
      prix: game.prix,
      ancien_prix: game.ancien_prix,
      stock: game.stock,
      nouveau: game.nouveau ?? 0
    };
    this.successMsg = '';
    this.errorMsg = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editForm = {};
  }

  saveEdit(game: Game): void {
    if (this.editingId == null) return;

    this.saving = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.gameService.updateGame(this.editingId, this.editForm).subscribe({
      next: (res) => {
        const index = this.games.findIndex(g => g.id_jeu === this.editingId);
        if (index !== -1) {
          this.games[index] = { ...this.games[index], ...res.jeu };
        }
        this.successMsg = `« ${this.games[index]?.titre ?? ''} » a été mis à jour.`;
        this.editingId = null;
        this.editForm = {};
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'La mise à jour a échoué. Veuillez réessayer.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- ACTIONS DE CRÉATION ---
  startCreate(): void {
    this.cancelEdit();
    this.isCreating = true;
    this.selectedCategories = [];
    this.selectedPlateformes = [];
    this.editForm = {
      titre: '',
      description: '',
      image_url: '',
      prix: 0,
      ancien_prix: undefined,
      stock: 0,
      nouveau: 0
    };
    this.successMsg = '';
    this.errorMsg = '';
  }

  cancelCreate(): void {
    this.isCreating = false;
    this.editForm = {};
    this.selectedCategories = [];
    this.selectedPlateformes = [];
  }

  // Gestion des cases à cocher Catégories
  toggleCategory(id: number, event: any): void {
    if (event.target.checked) {
      this.selectedCategories.push(id);
    } else {
      this.selectedCategories = this.selectedCategories.filter(c => c !== id);
    }
  }

  // Gestion des cases à cocher Plateformes
  togglePlatform(id: number, event: any): void {
    if (event.target.checked) {
      this.selectedPlateformes.push(id);
    } else {
      this.selectedPlateformes = this.selectedPlateformes.filter(p => p !== id);
    }
  }

  saveCreate(): void {
    if (this.selectedCategories.length === 0 || this.selectedPlateformes.length === 0) {
      this.errorMsg = 'Veuillez sélectionner au moins un type de jeu (catégorie) et une plateforme.';
      return;
    }

    this.saving = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    // On greffe les tableaux de sélections multiples à l'objet envoyé au PHP
    const payload = {
      ...this.editForm,
      id_categories: this.selectedCategories,
      id_plateformes: this.selectedPlateformes
    };

    this.gameService.createGame(payload).subscribe({
      next: (res) => {
        this.games.unshift(res.jeu); 
        this.successMsg = `« ${res.jeu.titre} » a bien été ajouté au catalogue.`;
        this.isCreating = false;
        this.editForm = {};
        this.selectedCategories = [];
        this.selectedPlateformes = [];
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'L\'ajout du jeu a échoué. Veuillez réessayer.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteGame(game: Game): void {
    const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer définitivement le jeu « ${game.titre} » ?`);
    if (confirmDelete && game.id_jeu) {
      this.errorMsg = '';
      this.successMsg = '';
      
      this.gameService.deleteGame(game.id_jeu).subscribe({
        next: () => {
          this.games = this.games.filter(g => g.id_jeu !== game.id_jeu);
          this.successMsg = `« ${game.titre} » a été supprimé du catalogue.`;
          this.cdr.detectChanges();
        },
        error: () => {
          this.errorMsg = `Impossible de supprimer « ${game.titre} ».`;
          this.cdr.detectChanges();
        }
      });
    }
  }
}