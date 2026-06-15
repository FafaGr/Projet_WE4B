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

// Interface de réponse pour la création d'un jeu
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
  
  // Nouvelles URL d'API pour la création et la suppression
  private createApiUrl = 'http://localhost/WE4B/api/create-game.php';
  private deleteApiUrl = 'http://localhost/WE4B/api/delete-game.php';

  constructor(private http: HttpClient) {}

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

  /**
   * Met à jour les informations d'un jeu (admin).
   */
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

  /**
   * Ajoute un nouveau jeu (admin).
   */
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

  /**
   * Supprime un jeu à partir de son ID (admin).
   */
  deleteGame(id: number): Observable<{ success: boolean }> {
    let params = new HttpParams().set('id', id.toString());
    
    // Utilisation d'une requête DELETE avec passage de l'ID en paramètre d'URL (ou query param)
    return this.http.delete<{ success: boolean }>(this.deleteApiUrl, { params });
  }
}