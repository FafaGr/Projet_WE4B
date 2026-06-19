import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { OrderLine } from '../../models/order.model';
import { OrderLineCardComponent } from '../order-line-card/order-line-card.component'; // ← Import du composant enfant

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, OrderLineCardComponent], // ← Ajouté aux imports
  templateUrl: './myorders.component.html',
})
export class MyOrdersComponent implements OnInit {

  commandes: OrderLine[] = [];
  isLoading = true;
  userName  = '';

  // Propriétés de stockage des totaux (calculés une seule fois au chargement)
  totalDepense = 0;
  totalJeux = 0;

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser();

    // Redirection si l'utilisateur n'est pas connecté
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.userName = user.nom;
    this.cdr.detectChanges();

    // Récupération de l'historique des achats depuis l'API PHP via MySQL
    this.orderService.getMyOrders(user.id_user).subscribe({
      next: (data) => {
        this.commandes = data;
        
        // Optimisation de performance : calcul des totaux à la réception des données uniquement
        this.totalDepense = this.commandes.reduce((sum, current) => sum + current.total_ligne, 0);
        this.totalJeux = this.commandes.reduce((sum, current) => sum + current.qty, 0);

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des commandes', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}