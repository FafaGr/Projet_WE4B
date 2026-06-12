import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {

  searchQuery = '';
  cartCount   = 0;
  currentPlatform: string | null = null;
  currentUser$!: Observable<User | null>;

  constructor(
    public authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
     this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Badge panier en temps réel
    this.cartService.cartCount$.subscribe(count => this.cartCount = count);

    // Détecte la plateforme active depuis l'URL
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      const params = new URLSearchParams(this.router.url.split('?')[1] || '');
      this.currentPlatform = params.get('platform');
    });
  }

  search(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/games'], { queryParams: { search: this.searchQuery } });
    }
  }

  onSearchKeyup(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.search();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}