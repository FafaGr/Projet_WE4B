import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, startWith, switchMap } from 'rxjs';
import { GameService } from '../services/game.service';
import { CartService } from '../services/cart.service';
import { Game, GameFilters } from '../models/game.model';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.css']
})
export class GameListComponent implements OnInit {

  filterForm = new FormGroup({
    search:   new FormControl(''),
    category: new FormControl(0),
    sort:     new FormControl('news')
  });

  private platform$ = new BehaviorSubject<'PC' | 'Console' | null>(null);

  games: Game[] = [];
  categories: any[] = [];
  isLoading = false;
  hasError = false;

  // AJOUT : feedback visuel bouton panier par jeu
  cartFeedback: Record<number, string> = {};

  constructor(
    private gameService: GameService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Écoute le paramètre ?platform= dans l'URL
    this.route.queryParamMap.subscribe(params => {
      const plat = params.get('platform') as 'PC' | 'Console' | null;
      this.platform$.next(plat);
    });

    this.categories = [
      { id_cat: 1, libelle: 'Action' },
      { id_cat: 2, libelle: 'Aventure' },
      { id_cat: 3, libelle: 'RPG' },
      { id_cat: 4, libelle: 'FPS' },
      { id_cat: 5, libelle: 'OpenWorld' },
      { id_cat: 6, libelle: 'Sport' },
    ];

    combineLatest([
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.value)),
      this.platform$
    ]).pipe(
      switchMap(([formValues, platform]) => {
        this.isLoading = true;
        this.hasError  = false;
        this.cdr.detectChanges();

        const filters: GameFilters = {
          search:   formValues.search   || '',
          category: Number(formValues.category) || 0,
          sort:     (formValues.sort as GameFilters['sort']) || 'news',
          platform: platform
        };
        return this.gameService.getAll(filters);
      })
    ).subscribe({
      next: (data) => {
        this.games     = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.hasError  = true;
        this.cdr.detectChanges();
      }
    });
  }

  // AJOUT : retourne le statut et gère le feedback visuel
  addToCart(game: Game): void {
    const id     = game.id_jeu!;
    const status = this.cartService.addToCart(game);
    this.cartFeedback[id] = status;
    setTimeout(() => { this.cartFeedback[id] = 'idle'; }, 1200);
  }
}