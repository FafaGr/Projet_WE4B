import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Game, GameFilters } from '../models/game.model';

export interface GameDetailResponse {
  jeu: Game;
  plateformes: { nom_plateforme: string }[];
  avis: any[];
  noteMoyenne: number | null;
}

@Injectable({ providedIn: 'root' })
export class GameService {

  private apiUrl = 'http://localhost/WE4B/api/games.php';
  private detailApiUrl = 'http://localhost/WE4B/api/game-detail.php';

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
}