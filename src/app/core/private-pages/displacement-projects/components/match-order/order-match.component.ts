import { combineLatest, EMPTY, Observable, Subject, zip } from 'rxjs';
import { catchError, map, shareReplay, switchMap, withLatestFrom } from 'rxjs/operators';

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CanGetHeaders, Count, DateRFC3339, Id } from '@domains/common/models';
import { DriverService } from '@domains/driver';
import { DriverHeader } from '@domains/driver/models';
import { OrderMapper, OrderService } from '@domains/order';
import { Order, OrderMatchData, OrderTableRow } from '@domains/order/models';
import { TrailerService } from '@domains/trailer';
import { VehicleService } from '@domains/vehicle';
import { ErrorNotifier } from '@root-services/error-handler';
import { Ex, Exception } from '@root-services/error-handler/exception';
import { notifyError } from '@root-services/error-handler/utils';
import { mixinShowOrderDetails } from '@shared/dialog/order-details-dialog';
import { mix, mixinAutoUnsubscribe } from '@shared/mixins';
import { splitDate } from '@shared/utils';

import { OrderPickData } from './models';
import { OrderMatchService } from './order-match.service';

const { toTable } = OrderMapper;

const MixinBase = mix(class {}, [mixinAutoUnsubscribe, mixinShowOrderDetails]);

@Component({
  templateUrl: 'order-match.component.html',
  styleUrls: ['order-match.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderMatchComponent extends MixinBase {
  public readonly vehicleTitle: Observable<string>;
  public readonly chips: Observable<string[]>;

  public readonly total?: Count; // TODO: Сделать нормальную пагинацию. Тогда и использовать.
  public readonly orders: Observable<OrderTableRow[]>;

  private readonly takeInitiator = new Subject<Order['id']>();
  private readonly changePickDataInitiator = new Subject();

  constructor(
    protected readonly orderService: OrderService,
    protected readonly errorNotifier: ErrorNotifier,
    protected readonly dialog: MatDialog,

    private readonly vehicleService: VehicleService,
    private readonly trailerService: TrailerService,
    private readonly driverService: DriverService,
    private readonly matchService: OrderMatchService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
  ) {
    super();

    const pickDataChanges = this.getPickDataChanges();
    this.vehicleTitle = this.getVehicleTitle(pickDataChanges);
    this.chips = this.getChips(pickDataChanges);
    this.orders = this.getOrders(pickDataChanges);

    this.observeOrderTake(pickDataChanges);
    this.observeChangePickData(pickDataChanges);
  }

  changePickData(): void {
    this.changePickDataInitiator.next();
  }

  take(orderId: Order['id']): void {
    this.takeInitiator.next(orderId);
  }

  private getPickDataChanges(): Observable<OrderPickData> {
    return this.matchService.pickDataChanges.pipe(
      map((pickData) => pickData || this.backToProjects()),
      catchError(() => EMPTY),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  private getVehicleTitle(pickDataChanges: Observable<OrderPickData>): Observable<string> {
    return pickDataChanges.pipe(
      switchMap(({ brigade }) => this.getSelectedById(this.vehicleService, brigade.vehicleId)),
      map((vehicleHeader) => this.getChipString(vehicleHeader, ['model', 'registrationNumber'])),
    );
  }

  private getChips(pickDataChanges: Observable<OrderPickData>): Observable<string[]> {
    return pickDataChanges.pipe(
      switchMap(({ brigade, matchParams }) => {
        const { trailerId, driverId } = brigade;
        const { startLocation, startDate } = matchParams || {};
        const trailerHeader = this.getSelectedById(this.trailerService, trailerId);
        const driverHeader = this.getDriverById(driverId);

        return zip(driverHeader, trailerHeader).pipe(
          map(([driver, trailer]) => {
            const trailerChip = this.getChipString(trailer, ['model', 'registrationNumber']);
            const chips = [trailerChip];
            if (driver) chips.unshift(driver.lastNameAndInitials);

            if (startLocation) {
              const { city, region } = startLocation;
              const addressFromChip = `Откуда - ${city || ''}, ${region || ''}`;
              chips.push(addressFromChip);
            }

            if (startDate) {
              const startDateChip = this.transformChipDate(startDate);
              chips.push(startDateChip);
            }

            // if (addressTo) {
            //   const addressToChip = `Куда - ${addressTo}`;
            //   chips.push(addressToChip);
            // }

            return chips;
          }),
        );
      }),
    );
  }

  private getOrders(pickDataChanges: Observable<OrderPickData>): Observable<OrderTableRow[]> {
    return pickDataChanges.pipe(
      map(({ brigade, matchParams }): OrderMatchData => {
        const { trailerId } = brigade;
        return { trailerId, ...matchParams };
      }),
      switchMap((matchData) => this.orderService.matchToFlight(matchData)),
      map(toTable),
    );
  }

  private observeOrderTake(pickDataChanges: Observable<OrderPickData>): void {
    const orderId = this.takeInitiator;
    const flightId = pickDataChanges.pipe(map(({ brigade }) => brigade.id));

    const subscription = combineLatest([orderId, flightId])
      .pipe(
        switchMap(([orderId, flightId]) => this.orderService.take({ orderId, flightId })),
        notifyError(this.errorNotifier),
      )
      .subscribe(() => this.goToProjects());

    this._subscriptions.add(subscription);
  }

  private observeChangePickData(pickDataChanges: Observable<OrderPickData>): void {
    const subscription = this.changePickDataInitiator
      .pipe(withLatestFrom(pickDataChanges))
      .subscribe(([, pickData]) => this.matchService.changePickData(pickData));

    this._subscriptions.add(subscription);
  }

  private getSelectedById<T extends { id: Id }>(
    service: CanGetHeaders<T>,
    selectedId: string,
  ): Observable<T | undefined> {
    return service.getHeaders().pipe(map((entities) => entities.find(({ id }) => id === selectedId)));
  }

  private getDriverById(selectedId: string): Observable<DriverHeader | undefined> {
    return this.driverService
      .getHeaders()
      .pipe(map((driver) => driver.find(({ userId }) => userId === selectedId)));
  }

  private getChipString<T>(entity: T | undefined, schema: (keyof T)[]): string {
    if (!entity) return '';
    const blankChip = schema.reduce((acc, key) => `${acc} ${entity[key]}`, '');
    return blankChip.trim();
  }

  private transformChipDate(startDate: DateRFC3339): string {
    const date = new Date(startDate);
    const [year, month, day, hour, minute] = splitDate(date);
    return `${day}.${month}.${year} ${hour}:${minute}`;
  }

  private goToProjects(): void {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  private backToProjects(): never {
    this.goToProjects();
    throw new Exception(Ex.MISSING_PICK_PARAMS);
  }
}
