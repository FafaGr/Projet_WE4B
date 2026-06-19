import { Routes } from '@angular/router';
import { GameListComponent } from './features/game-list/game-list.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { CartComponent } from './features/cart/cart.component';
import { GameDetailComponent } from './features/game-details/game-detail.component';
import { MyOrdersComponent } from './features/myorders/myorders.component';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';
import { AdminGamesComponent } from './features/admin-games/admin-games.component';
import { AdminCommandesComponent } from './features/admin-commandes/admin-commandes.component';
import { HomeComponent } from './features/home.component';

export const routes: Routes = [
  { path: '',         component: HomeComponent },
  { path: 'games',    component: HomeComponent},
  { path: 'games/:id', component: GameDetailComponent }, 
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cart',     component: CartComponent },
  { path: 'orders',   component: MyOrdersComponent },
  { path: 'admin',    component: AdminDashboardComponent },
  { path: 'admin/games',       component: AdminGamesComponent },
  { path: 'admin/commandes',       component: AdminCommandesComponent },
];