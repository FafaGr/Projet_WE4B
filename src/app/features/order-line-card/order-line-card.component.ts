import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderLine } from '../../models/order.model';

@Component({
  selector: 'app-order-line-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-line-card.component.html'
})
export class OrderLineCardComponent {
  @Input() cmd!: OrderLine;
}