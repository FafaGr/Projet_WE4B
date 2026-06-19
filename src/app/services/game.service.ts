// src/app/services/game.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Game, GameFilters } from '../models/game.model';
import { Review } from '../models/review.model';

export interface GameDetailResponse {
  jeu: Game;
  plateformes: { nom_plateforme: string }[];
  avis: any[];
  noteMoyenne: number | null;
}

export interface UpdateGameResponse {
  success: boolean;
  jeu: Game;
}

export interface CreateGameResponse {
  success: boolean;
  jeu: Game;
}

@Injectable({ providedIn: 'root' })
export class GameService {

  private apiUrl = 'http://localhost/WE4B/api/games.php';
  private detailApiUrl = 'http://localhost/WE4B/api/game-detail.php';
  private updateApiUrl = 'http://localhost/WE4B/api/update-game.php';
  private reviewApiUrl = 'http://localhost/WE4B/api/post_review.php';
  private createApiUrl = 'http://localhost/WE4B/api/create-game.php';
  private deleteApiUrl = 'http://localhost/WE4B/api/delete-game.php';
  
  // URL vers le script de tracking MongoDB
  private trackApiUrl = 'http://localhost/WE4B/api/track-action.php';

  constructor(private http: HttpClient) {}

  /**
   * Envoie une interaction utilisateur vers MongoDB
   */
  logAction(typeAction: string, idJeu?: number, idUser?: number, details?: any): void {
    const payload = {
      type_action: typeAction,
      id_jeu: idJeu || null,
      id_user: idUser || null,
      details: details || null
    };

    // Exécution en tâche de fond (.subscribe isolé)
    this.http.post(this.trackApiUrl, payload).subscribe({
      error: (err) => console.error('Erreur lors du tracking NoSQL :', err)
    });
  }

  getAll(filters?: GameFilters): Observable<Game[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.platform)                    params = params.set('platform', filters.platform);
      if (filters.category && filters.category !== 0) params = params.set('category', filters.category.toString());
      if (filters.search)                      params = params.set('search', filters.search);
      if (filters.sort)                        params = params.set('sort', filters.sort);
    }

    return this.http.get<Game[]>(this.apiUrl, { params }).pipe(
      map(games => games.map(g => ({
        ...g,
        prix:        +g.prix,
        ancien_prix: g.ancien_prix != null ? +g.ancien_prix : null,
        stock:       +g.stock,
        note:        g.note != null ? +g.note : undefined,
        categories_noms: g.categories_noms
          ? [...new Set(g.categories_noms.split(', '))].join(', ')
          : undefined,
      })))
    );
  }

  postReview(review: Review): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(this.reviewApiUrl, review);
  }

  getById(id: number): Observable<GameDetailResponse> {
    let params = new HttpParams().set('id', id.toString());

    return this.http.get<GameDetailResponse>(this.detailApiUrl, { params }).pipe(
      map(res => ({
        ...res,
        jeu: {
          ...res.jeu,
          prix:        +res.jeu.prix,
          ancien_prix: res.jeu.ancien_prix != null ? +res.jeu.ancien_prix : null,
          stock:       +res.jeu.stock,
          note:        res.jeu.note != null ? +res.jeu.note : undefined,
          categories_noms: res.jeu.categories_noms
            ? [...new Set(res.jeu.categories_noms.split(', '))].join(', ')
            : undefined,
        }
      }))
    );
  }

  updateGame(id: number, data: Partial<Game>): Observable<UpdateGameResponse> {
    const payload = { id_jeu: id, ...data };
    return this.http.put<UpdateGameResponse>(this.updateApiUrl, payload).pipe(
      map(res => ({
        ...res,
        jeu: {
          ...res.jeu,
          prix:        +res.jeu.prix,
          ancien_prix: res.jeu.ancien_prix != null ? +res.jeu.ancien_prix : null,
          stock:       +res.jeu.stock,
          note:        res.jeu.note != null ? +res.jeu.note : undefined,
          categories_noms: res.jeu.categories_noms
            ? [...new Set(res.jeu.categories_noms.split(', '))].join(', ')
            : undefined,
        }
      }))
    );
  }

  createGame(data: Partial<Game>): Observable<CreateGameResponse> {
    return this.http.post<CreateGameResponse>(this.createApiUrl, data).pipe(
      map(res => ({
        ...res,
        jeu: {
          ...res.jeu,
          prix:        +res.jeu.prix,
          ancien_prix: res.jeu.ancien_prix != null ? +res.jeu.ancien_prix : null,
          stock:       +res.jeu.stock,
          note:        res.jeu.note != null ? +res.jeu.note : undefined,
          categories_noms: res.jeu.categories_noms
            ? [...new Set(res.jeu.categories_noms.split(', '))].join(', ')
            : undefined,
        }
      }))
    );
  }

  private trendingApiUrl = 'http://localhost/WE4B/api/games-trending.php';

  getTrendingGames(): Observable<Game[]> {
    return this.http.get<Game[]>(this.trendingApiUrl).pipe(
      map(games => games.map(g => ({
        ...g,
        prix:        +g.prix,
        ancien_prix: g.ancien_prix != null ? +g.ancien_prix : null,
        stock:       +g.stock,
      })))
    );
  }

  deleteGame(id: number): Observable<{ success: boolean }> {
    let params = new HttpParams().set('id', id.toString());
    return this.http.delete<{ success: boolean }>(this.deleteApiUrl, { params });
  }
}