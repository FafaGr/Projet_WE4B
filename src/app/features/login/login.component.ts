import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  constructor(private authService: AuthService, private router: Router) {}

  submit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.error     = '';

    this.authService.login({
      email:    this.loginForm.value.email!,
      password: this.loginForm.value.password!,
    }).subscribe({
      next: () => this.router.navigate(['/games']),
      error: (err) => {
        this.error     = err.error?.error || 'Erreur de connexion.';
        this.isLoading = false;
      }
    });
  }
}