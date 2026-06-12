import { Routes } from '@angular/router';
import { GameListComponent } from './features/game-list.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';

export const routes: Routes = [
  { path: '',         redirectTo: 'games', pathMatch: 'full' },
  { path: 'games',    component: GameListComponent },
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },
];