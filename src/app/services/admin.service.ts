import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Game } from '../models/game.model';
import { OrderLine } from '../models/order.model';
import { Category, Platform } from '../models/catalog.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  // Base de l'API alignée sur ton dossier réel
  private apiUrl = 'http://localhost/WE4B/api'; 

  constructor(private http: HttpClient) {}

  // Utilise le fichier games.php existant pour lister les jeux du catalogue
  getAllGamesForAdmin(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/games.php`);
  }

  // Utilise le fichier game-detail.php existant pour récupérer le contexte d'un jeu
  getGameFormContext(id: number): Observable<{
    jeu: Game;
    plateformes: { nom_plateforme: string }[];
    avis: any[];
    noteMoyenne: number | null;
  }> {
    return this.http.get<{
      jeu: Game;
      plateformes: { nom_plateforme: string }[];
      avis: any[];
      noteMoyenne: number | null;
    }>(`${this.apiUrl}/game-detail.php?id=${id}`);
  }

  // Lié à ton fichier d'historique de commandes global (admin_commandes)
  getAllOrders(): Observable<OrderLine[]> {
    return this.http.get<OrderLine[]>(`${this.apiUrl}/orders.php`);
  }

  // --- Méthodes d'écriture à lier avec tes futurs scripts d'administration ---
  addGame(gameData: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/add_game.php`, gameData);
  }

  updateGame(id: number, gameData: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/edit_game.php?id=${id}`, gameData);
  }

  deleteGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete_game.php?delete_id=${id}`);
  }
}