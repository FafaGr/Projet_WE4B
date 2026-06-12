import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {

  registerForm = new FormGroup({
    firstName:       new FormControl('', Validators.required),
    lastName:        new FormControl('', Validators.required),
    email:           new FormControl('', [Validators.required, Validators.email]),
    password:        new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required),
    country:         new FormControl(''),
  });

  errors:    string[] = [];
  success    = false;
  isLoading  = false;

  // Force de mot de passe (0-100)
  get passwordStrength(): number {
    const p = this.registerForm.value.password || '';
    let s = 0;
    if (p.length >= 8)      s += 25;
    if (/[a-z]/.test(p))    s += 25;
    if (/[A-Z]/.test(p))    s += 25;
    if (/[0-9]/.test(p))    s += 25;
    return s;
  }

  get strengthColor(): string {
    const s = this.passwordStrength;
    return s < 50 ? '#dc3545' : s < 75 ? '#ffc107' : '#28a745';
  }

  constructor(private authService: AuthService, private router: Router) {}

  submit(): void {
    if (this.registerForm.invalid) return;
    this.isLoading = true;
    this.errors    = [];

    const v = this.registerForm.value;

    this.authService.register({
      firstName:       v.firstName!,
      lastName:        v.lastName!,
      email:           v.email!,
      password:        v.password!,
      confirmPassword: v.confirmPassword!,
    }).subscribe({
      next: () => {
        this.success   = true;
        this.isLoading = false;
      },
      error: (err) => {
        this.errors    = err.error?.errors || ['Une erreur est survenue.'];
        this.isLoading = false;
      }
    });
  }
}