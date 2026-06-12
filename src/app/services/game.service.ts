import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Game, GameFilters } from '../models/game.model';

@Injectable({ providedIn: 'root' })
export class GameService {

  
  private apiUrl = 'http://localhost/WE4B/api/games.php';

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
        // MySQL renvoie les nombres en string — on les force en number
        prix:        +g.prix,
        ancien_prix: g.ancien_prix != null ? +g.ancien_prix : null,
        stock:       +g.stock,
        note:        g.note != null ? +g.note : undefined,
        // GROUP_CONCAT génère des doublons quand un jeu a plusieurs JOIN — on les supprime
        categories_noms: g.categories_noms
          ? [...new Set(g.categories_noms.split(', '))].join(', ')
          : undefined,
      })))
    );
  }
}
