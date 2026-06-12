import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Game } from '../models/game.model';

export interface CartItem {
  id:       number;
  title:    string;
  price:    number;
  image:    string;
  stock:    number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {

  private readonly STORAGE_KEY = 'gameCart';

  // Observable du nombre total d'articles (pour le badge navbar)
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  // Observable du contenu complet (pour la page panier)
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  /** Ajoute un jeu au panier (ou incrémente la quantité). Retourne un status. */
  addToCart(game: Game): 'added' | 'stock_max' {
    const items = this.getItems();
    const existing = items.find(i => i.id === game.id_jeu);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty >= game.stock) {
      return 'stock_max';
    }

    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({
        id:       game.id_jeu!,
        title:    game.titre,
        price:    game.prix,
        image:    game.image_url,
        stock:    game.stock,
        quantity: 1,
      });
    }

    this.saveAndEmit(items);
    return 'added';
  }

  removeItem(id: number): void {
    this.saveAndEmit(this.getItems().filter(i => i.id !== id));
  }

  updateQuantity(id: number, quantity: number): void {
    const items = this.getItems();
    const item = items.find(i => i.id === id);
    if (item) {
      item.quantity = Math.max(1, Math.min(quantity, item.stock));
      this.saveAndEmit(items);
    }
  }

  clearCart(): void {
    this.saveAndEmit([]);
  }

  getItems(): CartItem[] {
    return [...this.cartItemsSubject.value];
  }

  getTotal(): number {
    return this.cartItemsSubject.value.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      const items: CartItem[] = raw ? JSON.parse(raw) : [];
      this.saveAndEmit(items);
    } catch {
      this.saveAndEmit([]);
    }
  }

  private saveAndEmit(items: CartItem[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.cartItemsSubject.next(items);
    this.cartCountSubject.next(items.reduce((n, i) => n + i.quantity, 0));
  }
}