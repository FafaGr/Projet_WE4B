import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styles: [`
    .cart-item { background-color: #1e1e2f; border: 1px solid #2d2d3f; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; display: flex; gap: 1.5rem; align-items: center; }
    .cart-item img { width: 120px; height: 120px; object-fit: cover; border-radius: 6px; }
    .cart-item-price { color: #dc3545; font-weight: 600; font-size: 1.3rem; }
    .quantity-control { display: flex; align-items: center; gap: 0.5rem; margin: 1rem 0; }
    .quantity-control button { background-color: #11111e; border: 1px solid #2d2d3f; color: #ffffff; width: 30px; height: 30px; padding: 0; border-radius: 4px; cursor: pointer; }
    .quantity-control button:hover { background-color: #dc3545; }
    .quantity-display { width: 50px; text-align: center; padding: 0.5rem; background-color: #11111e; border: 1px solid #2d2d3f; border-radius: 4px; }
    .cart-summary { background-color: #1e1e2f; border: 1px solid #2d2d3f; border-radius: 8px; padding: 2rem; position: sticky; top: 100px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #2d2d3f; }
    .summary-row.total { border-bottom: none; padding-bottom: 0; }
    .summary-row.total .summary-value { color: #dc3545; font-weight: 700; font-size: 1.5rem; }
    .btn-checkout { background-color: #dc3545; border: none; padding: 1rem; font-weight: 600; font-size: 1.1rem; width: 100%; border-radius: 8px; }
  `]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  promoCode: string = '';
  promoMessage: string = '';
  promoMessageType: 'success' | 'danger' | '' = '';
  activeDiscount: number = 0;
  isCheckingOut: boolean = false;
  orderConfirmed: boolean = false;

  private readonly PROMO_CODES: Record<string, number> = {
    'GAMER10': 10,
    'SAVE20': 20,
    'WELCOME': 15,
  };

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
  }

  get totalItems(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  get subtotal(): number {
    return this.cartService.getTotal();
  }

  get discountAmount(): number {
    return this.subtotal * (this.activeDiscount / 100);
  }

  get total(): number {
    return this.subtotal - this.discountAmount;
  }

  changeQuantity(id: number, currentQty: number, change: number): void {
    this.cartService.updateQuantity(id, currentQty + change);
  }

  removeItem(id: number): void {
    this.cartService.removeItem(id);
  }

  applyPromo(): void {
    const code = this.promoCode.trim().toUpperCase();
    if (this.PROMO_CODES[code] !== undefined) {
      this.activeDiscount = this.PROMO_CODES[code];
      this.promoMessageType = 'success';
      this.promoMessage = `✓ Code appliqué : -${this.activeDiscount}%`;
    } else {
      this.activeDiscount = 0;
      this.promoMessageType = 'danger';
      this.promoMessage = '✗ Code de réduction invalide';
    }
  }

  checkout(): void {
    if (this.cartItems.length === 0) return;

    // Vérifie que l'utilisateur est connecté
    const user = this.authService.currentUser();
    if (!user) {
      alert('Vous devez être connecté pour passer une commande.');
      this.router.navigate(['/login']);
      return;
    }

    this.isCheckingOut = true;

    // Appel vers l'API checkout.php
    this.http.post<{ success: boolean; error?: string }>('http://localhost/WE4B/api/checkout.php', {
      cart:    this.cartItems,
      user_id: user.id_user
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.cartService.clearCart();
          this.orderConfirmed = true;
        } else {
          alert(res.error || 'Une erreur est survenue lors de la commande.');
        }
        this.isCheckingOut = false;
      },
      error: (err) => {
        alert(err.error?.error || 'Erreur réseau. Vérifier que XAMPP est démarré');
        this.isCheckingOut = false;
      }
    });
    this.router.navigate(['/']);
  }
}