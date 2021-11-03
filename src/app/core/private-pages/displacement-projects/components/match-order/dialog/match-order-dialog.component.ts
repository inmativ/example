import { Observable, of, Subject } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DriverMapper, DriverService } from '@domains/driver';
import { Driver } from '@domains/driver/models';
import { FlightService } from '@domains/flight';
import { TrailerMapper, TrailerService } from '@domains/trailer';
import { Trailer } from '@domains/trailer/models';
import { VehicleMapper, VehicleService } from '@domains/vehicle';
import { Vehicle } from '@domains/vehicle/models';
import { ErrorNotifier } from '@root-services/error-handler';
import { notifyError } from '@root-services/error-handler/utils';
import { TODAY } from '@shared/constants';
import { ExtendedFormBuilder } from '@shared/extended-form';
import { TypedFormGroup } from '@shared/extended-form/models';
import { Validates } from '@shared/extended-form/validate';
import { SelectOption } from '@shared/inputs/models';
import { mix, mixinAutoUnsubscribe } from '@shared/mixins';
import { Location } from '@shared/models';

import {
  Brigade,
  BrigadeFormFields,
  BrigadeUpdate,
  OrderMatchParams,
  OrderMatchParamsFormFields,
  OrderPickDataBlank,
  SavedBrigade,
} from '../models';
import { getOrderMatchFormConfig } from './order-match.form-config';

const { required } = Validates;

const MatchOrderDialogMixinBase = mix(class {}, [mixinAutoUnsubscribe]);

type BrigadeForm = TypedFormGroup<BrigadeFormFields>;
type MatchParamsForm = TypedFormGroup<OrderMatchParamsFormFields>;

@Component({
  templateUrl: 'match-order-dialog.component.html',
  styleUrls: ['match-order-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchOrderDialogComponent extends MatchOrderDialogMixinBase {
  public readonly brigadeForm: BrigadeForm;
  public readonly matchParamsForm: MatchParamsForm;

  public readonly vehicleOptions: Observable<SelectOption<Vehicle['id']>[]>;
  public readonly trailerOptions: Observable<SelectOption<Trailer['id']>[]>;
  public readonly driverOptions: Observable<SelectOption<Driver['userId']>[]>;

  public minDate = TODAY();
  public offsetDescription = 'чч:мм';

  private readonly saveInitiator = new Subject<BrigadeUpdate>();

  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly data: OrderPickDataBlank,
    private readonly flightService: FlightService,
    private readonly dialogRef: MatDialogRef<MatchOrderDialogComponent>,
    private readonly notifier: ErrorNotifier,

    vehicleService: VehicleService,
    trailerService: TrailerService,
    driverService: DriverService,
    fb: ExtendedFormBuilder,
  ) {
    super();

    // TODO: Объединить две формы, когда будет удалена логика сохранения бригады
    this.brigadeForm = this.initBrigadeForm(fb, data.brigade);
    this.matchParamsForm = this.initMatchParamsForm(fb, data.matchParams);

    this.vehicleOptions = this.getVehicleOptions(vehicleService);
    this.trailerOptions = this.getTrailerOptions(trailerService);
    this.driverOptions = this.getDriverOptions(driverService);

    this.observeBrigadeSave();
    this.observeParamsChange();
  }

  submit(): void {
    if (this.brigadeForm.invalid || this.matchParamsForm.invalid) {
      this.brigadeForm.markAllAsTouched();
      this.matchParamsForm.markAllAsTouched();
      return;
    }
    const formValue = this.brigadeForm.getRawValue();
    const brigadeUpdate = { ...this.data.brigade, ...formValue };

    this.saveInitiator.next(brigadeUpdate);
  }

  private initBrigadeForm(fb: ExtendedFormBuilder, brigade: Brigade): BrigadeForm {
    const { vehicleId = '', trailerId = '', driverId = '' } = brigade;
    return fb.deprecatedExtendedGroup<BrigadeFormFields>({
      vehicleId: [{ value: vehicleId, disabled: true }, [required]],
      trailerId: [trailerId, [required]],
      driverId: [driverId, [required]],
    });
  }

  private initMatchParamsForm(fb: ExtendedFormBuilder, matchParams?: OrderMatchParams): MatchParamsForm {
    this.updateOffsetByLocation(matchParams?.startLocation);
    const config = getOrderMatchFormConfig(matchParams);
    return fb.group<OrderMatchParamsFormFields>(config);
  }

  private getVehicleOptions(service: VehicleService): Observable<SelectOption<Vehicle['id']>[]> {
    return service.getHeaders().pipe(map((headers) => VehicleMapper.toOptions(headers)));
  }

  private getTrailerOptions(service: TrailerService): Observable<SelectOption<Trailer['id']>[]> {
    return service.getHeaders().pipe(map((headers) => TrailerMapper.toOptions(headers)));
  }

  private getDriverOptions(service: DriverService): Observable<SelectOption<Driver['userId']>[]> {
    return service.getShortInfoByFilter({}).pipe(map((drivers) => DriverMapper.toOptions(drivers)));
  }

  private observeBrigadeSave(): void {
    const subscription = this.saveInitiator
      .pipe(
        switchMap((brigade) => this.saveBrigade(brigade)),
        notifyError(this.notifier),
      )
      .subscribe((brigade) => {
        const matchParams = this.matchParamsForm.value;
        return this.dialogRef.close({ brigade, matchParams });
      });

    this._subscriptions.add(subscription);
  }

  private observeParamsChange(): void {
    const control = this.matchParamsForm.controls.startLocation;
    if (!control) return;

    const subscription = control.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((location) => this.updateOffsetByLocation(location));

    this._subscriptions.add(subscription);
  }

  private updateOffsetByLocation(location?: Location | null): void {
    this.offsetDescription = location?.city || 'чч:мм';
  }

  private saveBrigade(brigade: BrigadeUpdate): Observable<SavedBrigade> {
    if (this.isFormPristine(brigade) && this.data.brigade.id) return of(brigade);
    return this.flightService.save(brigade).pipe(map((id) => ({ ...brigade, id })));
  }

  private isFormPristine(brigade: BrigadeUpdate): brigade is SavedBrigade {
    return this.brigadeForm.pristine;
  }
}
