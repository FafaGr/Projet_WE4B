import { Routes } from '@angular/router';
import { GameListComponent } from './features/game-list.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { CartComponent } from './features/cart/cart.component';
import { GameDetailComponent } from './features/game-detail.component';
import { MyOrdersComponent } from './features/myorders/myorders.component';

export const routes: Routes = [
  { path: '',         redirectTo: 'games', pathMatch: 'full' },
  { path: 'games',    component: GameListComponent },
  { path: 'games/:id', component: GameDetailComponent }, 
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cart',     component: CartComponent },
  { path: 'orders',   component: MyOrdersComponent },
];