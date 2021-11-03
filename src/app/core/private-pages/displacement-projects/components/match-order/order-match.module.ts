import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TrailerBodyStyleModule } from '@dictionary/trailer-body-style';
import { FlightModule } from '@domains/flight';
import { OrderModule } from '@domains/order';
import { BadgeModule } from '@shared/badge/badge.module';
import { ColumnSorterModule } from '@shared/column-sorter';
import { OrderDetailsDialogModule } from '@shared/dialog/order-details-dialog';
import { IconModule } from '@shared/icon';
import { DivideDigitsModule } from '@shared/pipes/divide-digits';

import { MatchOrderDialogModule } from './dialog';
import { OrderMatchComponent } from './order-match.component';
import { OrderMatchService } from './order-match.service';
import { OrderMatchTableComponent } from './table/order-match-table.component';

@NgModule({
  declarations: [OrderMatchComponent, OrderMatchTableComponent],
  imports: [
    CommonModule,
    RouterModule,
    BadgeModule,
    MatchOrderDialogModule,
    OrderModule,
    DivideDigitsModule,
    FlightModule,
    IconModule,
    ColumnSorterModule,
    TrailerBodyStyleModule,
    OrderDetailsDialogModule,
  ],
  providers: [OrderMatchService],
  exports: [OrderMatchComponent],
})
export class OrderMatchModule {}
