import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost/WE4B/api'; // ← même base que game.service.ts

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Restaure la session depuis localStorage au démarrage
    const saved = localStorage.getItem('user_session');
    if (saved) {
      try { this.currentUserSubject.next(JSON.parse(saved)); } catch {}
    }
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login.php`, credentials).pipe(
      tap(user => {
        localStorage.setItem('user_session', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  register(data: {
    firstName: string;
    lastName:  string;
    email:     string;
    password:  string;
    confirmPassword: string;
  }): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/register.php`, data);
  }

  logout(): void {
    localStorage.removeItem('user_session');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean { return this.currentUserSubject.value !== null; }
  isAdmin(): boolean         { return this.currentUserSubject.value?.role === 'admin'; }
  currentUser(): User | null { return this.currentUserSubject.value; }
}