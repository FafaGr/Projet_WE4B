import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GameService } from '../services/game.service';
import { CartService } from '../services/cart.service';
import { Game } from '../models/game.model';
import { GameCardComponent } from './game-card/game-card.component';
import { GameListComponent } from './game-list/game-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, GameCardComponent, GameListComponent], // ← Ajouté aux imports
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  
  jeuxDuMoment: Game[] = [];
  cartFeedback: Record<number, string> = {};

  constructor(
    private gameService: GameService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  this.gameService.getTrendingGames().subscribe({
    next: (data) => {
      
      if (data && data.length === 3) {
        this.jeuxDuMoment = [data[1], data[0], data[2]];
      } else {
        this.jeuxDuMoment = data; // Sécurité si moins de 3 jeux
      }
      this.cdr.detectChanges();
    },
    error: (err) => console.error('Impossible de charger les tendances NoSQL', err)
  });
}

  /**
   * Traite l'ajout au panier si l'utilisateur clique sur un jeu du moment
   */
  addToCart(game: Game): void {
    const id = game.id_jeu!;
    const status = this.cartService.addToCart(game);
    this.cartFeedback[id] = status;
    
    setTimeout(() => { 
      this.cartFeedback[id] = 'idle'; 
      this.cdr.detectChanges();
    }, 1200);
  }
}