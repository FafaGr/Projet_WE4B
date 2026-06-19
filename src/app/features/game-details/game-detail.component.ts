// src/app/components/game-detail.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { switchMap, filter, map, take, tap } from 'rxjs/operators';
import { GameService, GameDetailResponse } from '../../services/game.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Review } from '../../models/review.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './game-detail.component.html',
})
export class GameDetailComponent implements OnInit {
  
  detailData?: GameDetailResponse;
  isLoading = true;
  hasError = false;
  cartFeedback: string = 'idle';
  newReview: { note: number; com: string } = { note: 5, com: '' };
  isSubmitting = false;
  reviewError = '';
  reviewSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private gameService: GameService,
    private cartService: CartService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  submitReview(): void {
    if (!this.detailData || !this.currentUser) return;
    this.isSubmitting = true;
    this.reviewError = '';

    const review: Review = {
      id_utilisateur: this.currentUser.id_user,
      id_jeu: this.detailData.jeu.id_jeu!,
      com: this.newReview.com.trim(),
      note: this.newReview.note,
    };

    this.gameService.postReview(review).subscribe({
      next: () => {
        this.reviewSuccess = true;
        this.isSubmitting = false;
        this.newReview = { note: 5, com: '' };
        
        this.gameService.getById(this.detailData!.jeu.id_jeu!).subscribe(data => {
          this.detailData = data;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
          this.reviewError = err.status === 409
          ? 'Vous avez déjà posté un avis pour ce jeu.'
          : 'Erreur lors de l\'envoi. Réessayez.';
          this.isSubmitting = false;
          this.cdr.detectChanges();
      }
    });
  }
  
  get hasAlreadyReviewed(): boolean {
    if (!this.detailData || !this.currentUser) return false;
    return this.detailData.avis.some(av => av.id_utilisateur === this.currentUser!.id_user);
  }

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

        // -> TRACKING NO SQL : Enregistrement de la consultation de page
        const userId = this.currentUser ? this.currentUser.id_user : undefined;
        this.gameService.logAction('view_page', data.jeu.id_jeu, userId);
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

    // -> TRACKING NO SQL : Enregistrement de l'ajout au panier
    const userId = this.currentUser ? this.currentUser.id_user : undefined;
    this.gameService.logAction('add_to_cart', this.detailData.jeu.id_jeu, userId);

    setTimeout(() => { this.cartFeedback = 'idle'; }, 1500);
  }
}