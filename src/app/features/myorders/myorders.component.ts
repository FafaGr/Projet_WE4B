import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { OrderLine } from '../../models/order.model';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './myorders.component.html',
})
export class MyOrdersComponent implements OnInit {

  commandes: OrderLine[] = [];
  isLoading = true;
  userName  = '';

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.userName = user.nom;
    this.cdr.detectChanges();

    this.orderService.getMyOrders(user.id_user).subscribe({
      next: (data) => {
        this.commandes = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get totalDepense(): number {
    return this.commandes.reduce((s, c) => s + c.total_ligne, 0);
  }

  get totalJeux(): number {
    return this.commandes.reduce((s, c) => s + c.qty, 0);
  }
}