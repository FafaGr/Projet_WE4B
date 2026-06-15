import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderLine } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {

  private apiUrl = 'http://localhost/WE4B/api';

  constructor(private http: HttpClient) {}

  getMyOrders(userId: number): Observable<OrderLine[]> {
    const params = new HttpParams().set('user_id', userId.toString());
    return this.http.get<OrderLine[]>(`${this.apiUrl}/orders.php`, { params }).pipe(
      map(orders => orders.map(o => ({
        ...o,
        
        jeu_prix:    +o.jeu_prix,
        total_ligne: +o.total_ligne,
        qty:         +o.qty,
      })))
    );
  }
}