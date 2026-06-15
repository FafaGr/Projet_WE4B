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
  loading = true;

  errorMsg = '';
  successMsg = '';

  search = '';

  editingId: number | null = null;
  editForm: Partial<Game> = {};
  saving = false;

  // Variables pour la création
  isCreating = false;

  constructor(
    private gameService: GameService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
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
    this.cancelCreate(); // Ferme le formulaire d'ajout si ouvert
    this.editingId = game.id_jeu ?? null;
    this.editForm = {
      titre: game.titre,
      description: game.description,
      image_url: game.image_url,
      prix: game.prix,
      ancien_prix: game.ancien_prix,
      stock: game.stock,
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
    this.cancelEdit(); // Ferme une édition en cours si ouverte
    this.isCreating = true;
    this.editForm = {
      titre: '',
      description: '',
      image_url: '',
      prix: 0,
      ancien_prix: undefined,
      stock: 0
    };
    this.successMsg = '';
    this.errorMsg = '';
  }

  cancelCreate(): void {
    this.isCreating = false;
    this.editForm = {};
  }

  saveCreate(): void {
    this.saving = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    // Remplace "createGame" par le nom exact de ta méthode d'ajout dans gameService
    this.gameService.createGame(this.editForm).subscribe({
      next: (res) => {
        // Ajoute le nouveau jeu en haut de la liste locale
        this.games.unshift(res.jeu); 
        this.successMsg = `« ${res.jeu.titre} » a bien été ajouté au catalogue.`;
        this.isCreating = false;
        this.editForm = {};
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

  // --- ACTION DE SUPPRESSION ---
  deleteGame(game: Game): void {
    const confirmDelete = confirm(`Êtes-vous sûr de vouloir supprimer définitivement le jeu « ${game.titre} » ?`);
    
    if (confirmDelete && game.id_jeu) {
      this.errorMsg = '';
      this.successMsg = '';
      
      // Remplace "deleteGame" par le nom exact de ta méthode de suppression dans gameService
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