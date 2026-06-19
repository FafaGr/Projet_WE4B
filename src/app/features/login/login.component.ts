// src/app/features/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GameService } from '../../services/game.service'; // ← Infiltration du tracker NoSQL

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {

  loginForm = new FormGroup({
    email:    new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  error     = '';
  isLoading = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private gameService: GameService // ← Injection du service global de tracking
  ) {}

  submit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.error     = '';

    this.authService.login({
      email:    this.loginForm.value.email!,
      password: this.loginForm.value.password!,
    }).subscribe({
      next: (user: any) => {
        
        // --- TRACKING MONGODB ---
        // Si l'utilisateur est authentifié avec succès, on consigne l'événement
        if (user && user.id_user) {
          // On transmet 0 pour le jeu (aucun jeu ciblé) et l'ID utilisateur réel
          this.gameService.logAction('user_login', 0, user.id_user, {
            nom_utilisateur: user.nom || 'Utilisateur'
          });
        }

        // Redirection vers le catalogue après traitement du log
        this.router.navigate(['/games']);
      },
      error: (err) => {
        this.error     = err.error?.error || 'Erreur de connexion.';
        this.isLoading = false;
      }
    });
  }
}