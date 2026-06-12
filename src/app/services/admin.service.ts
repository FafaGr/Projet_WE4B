import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Game } from '../models/game.model';
import { OrderLine } from '../models/order.model';
import { Category, Platform } from '../models/catalog.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'https://api.mon-gamestore.com/admin';

  constructor(private http: HttpClient) {}

  // Traduit AdminController::listGames()
  getAllGamesForAdmin(): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.apiUrl}/list-games.php`);
  }

  // Traduit AdminController::addGame() (Traitement du POST)
  addGame(gameData: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/add-game.php`, gameData);
  }

  // Traduit AdminController::editGame() (Récupération des données du formulaire)
  getGameFormContext(id: number): Observable<{
    jeu: Game;
    currentCatsIds: number[];
    currentPlatsIds: number[];
  }> {
    return this.http.get<{
      jeu: Game;
      currentCatsIds: number[];
      currentPlatsIds: number[];
    }>(`${this.apiUrl}/edit-game-context.php?id=${id}`);
  }

  // Traduit AdminController::editGame() (Traitement de la modification en POST)
  updateGame(id: number, gameData: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/edit-game.php?id=${id}`, gameData);
  }

  // Traduit AdminController::deleteGame()
  deleteGame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-game.php?delete_id=${id}`);
  }

  // Traduit AdminController::listOrders()
  getAllOrders(): Observable<OrderLine[]> {
    return this.http.get<OrderLine[]>(`${this.apiUrl}/list-orders.php`);
  }
}