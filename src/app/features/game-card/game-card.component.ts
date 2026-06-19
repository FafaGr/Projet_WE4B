import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Game } from '../../models/game.model';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game-card.component.html',
})
export class GameCardComponent {
  @Input() jeu!: Game;
  @Input() feedback: string = 'idle';
  
  @Output() addToCartClick = new EventEmitter<Game>();

  onAddToCart(): void {
    this.addToCartClick.emit(this.jeu);
  }
}