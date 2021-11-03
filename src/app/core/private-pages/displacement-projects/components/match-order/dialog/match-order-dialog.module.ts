import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { DriverModule } from '@domains/driver';
import { FlightModule } from '@domains/flight';
import { TrailerModule } from '@domains/trailer';
import { VehicleModule } from '@domains/vehicle';
import { ExtendedFormModule } from '@shared/extended-form';
import { PlainAutocompleteModule } from '@shared/inputs';
import { PlainLocationModule } from '@shared/inputs/location';
import { FieldsetMomentModule, PlainMomentModule } from '@shared/inputs/moment';

import { MatchOrderDialogComponent } from './match-order-dialog.component';

@NgModule({
  declarations: [MatchOrderDialogComponent],
  imports: [
    CommonModule,
    DriverModule,
    ExtendedFormModule,
    FieldsetMomentModule,
    FlightModule,
    MatDialogModule,
    PlainAutocompleteModule,
    PlainLocationModule,
    PlainMomentModule,
    ReactiveFormsModule,
    TrailerModule,
    VehicleModule,
  ],
})
export class MatchOrderDialogModule {}
