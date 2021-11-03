import { svgTrailer, svgTruck } from 'src/assets/ts';

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Order, OrderTableRow } from '@domains/order/models';
import { IconRegistry } from '@shared/icon';

@Component({
  selector: 'app-order-match-table',
  templateUrl: 'order-match-table.component.html',
  styleUrls: ['order-match-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderMatchTableComponent {
  @Input() public orders: OrderTableRow[] | null = [];
  @Output() orderTake = new EventEmitter();
  @Output() detailsShow = new EventEmitter<Order['id']>();

  constructor(iconRegistry: IconRegistry) {
    iconRegistry.add([svgTruck, svgTrailer]);
  }

  showDetails(orderId: Order['id']): void {
    this.detailsShow.next(orderId);
  }

  take(id: Order['id']): void {
    this.orderTake.emit(id);
  }
}
