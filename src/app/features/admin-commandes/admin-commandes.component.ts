import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { OrderLine } from '../../models/order.model';

@Component({
  selector: 'app-admin-commandes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-commandes.component.html',
})
export class AdminCommandesComponent implements OnInit {
  orders: OrderLine[] = [];
  loading = true;
  totalVentes = 0;

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllOrders();
  }

  loadAllOrders(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        // Calcul du chiffre d'affaires cumulé global
        this.totalVentes = data.reduce((sum, order) => sum + order.total_ligne, 0);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur lors de la récupération des ventes", err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}