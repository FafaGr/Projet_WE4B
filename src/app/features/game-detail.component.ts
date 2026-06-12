import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { switchMap, filter, map, take } from 'rxjs/operators';
import { GameService, GameDetailResponse } from '../services/game.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game-detail.component.html',
})
export class GameDetailComponent implements OnInit {
  
  detailData?: GameDetailResponse;
  isLoading = true;
  hasError = false;
  cartFeedback: string = 'idle';

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      filter(id => id > 0),
      take(1),
      switchMap(id => {
        this.isLoading = true;
        this.hasError = false;
        this.cdr.detectChanges();
        return this.gameService.getById(id);
      })
    ).subscribe({
      next: (data) => {
        this.detailData = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.hasError = true;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getStars(rating: number): ('full' | 'half' | 'empty')[] {
    const stars: ('full' | 'half' | 'empty')[] = [];
    const fullStars = Math.floor(rating);
    const hasHalf = (rating - fullStars) >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) stars.push('full');
      else if (i === fullStars && hasHalf) stars.push('half');
      else stars.push('empty');
    }
    return stars;
  }

  addToCart(): void {
    if (!this.detailData) return;
    const status = this.cartService.addToCart(this.detailData.jeu);
    this.cartFeedback = status;
    setTimeout(() => { this.cartFeedback = 'idle'; }, 1500);
  }
}