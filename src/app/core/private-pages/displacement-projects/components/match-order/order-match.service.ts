import { Observable, Subject } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { mixinAutoUnsubscribe } from '@shared/mixins';
import { takeTruly } from '@shared/utils';

import { MatchOrderDialogComponent } from './dialog';
import { OrderPickData, OrderPickDataBlank } from './models';

const config: MatDialogConfig = { width: '590px' };

const OrderMatchServiceMixinBase = mixinAutoUnsubscribe(class {});

@Injectable()
export class OrderMatchService extends OrderMatchServiceMixinBase {
  public readonly pickDataChanges: Observable<OrderPickData | null>;

  private readonly dialogInitiator = new Subject<OrderPickDataBlank>();

  constructor(private readonly dialog: MatDialog) {
    super();
    this.pickDataChanges = this.observePickDataChange();
  }

  changePickData(pickData: OrderPickDataBlank): void {
    this.dialogInitiator.next(pickData);
  }

  private observePickDataChange(): Observable<OrderPickData | null> {
    return this.dialogInitiator.pipe(
      map((pickData) => this.openDialog(pickData)),
      switchMap((dialogRef) => dialogRef.afterClosed()),
      takeTruly(),
      startWith(null),
      shareReplay({ refCount: false, bufferSize: 1 }),
    );
  }

  private openDialog(data: OrderPickDataBlank): MatDialogRef<MatchOrderDialogComponent, OrderPickData> {
    return this.dialog.open<MatchOrderDialogComponent, OrderPickDataBlank, OrderPickData>(
      MatchOrderDialogComponent,
      { ...config, data },
    );
  }
}
