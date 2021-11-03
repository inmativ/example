import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FlightStatusModule } from '@dictionary/flight-status';
import { VehicleStateModule } from '@dictionary/vehicle-state';
import { DisplacementProjectModule } from '@domains/displacement-project';
import { DriverModule } from '@domains/driver';
import { TrailerModule } from '@domains/trailer';
import { VehicleModule } from '@domains/vehicle';
import { BadgeModule } from '@shared/badge';
import { ColumnSorterModule } from '@shared/column-sorter';
import { FlightCancelModule } from '@shared/dialog/flight-cancel';
import { FlightDetailsDialogModule } from '@shared/dialog/flight-details-dialog';
import { PlainAutocompleteModule, PlainSelectModule } from '@shared/inputs';
import { FlagSwitchModule } from '@shared/inputs/flag-switch';
import { DivideDigitsModule } from '@shared/pipes/divide-digits';

import {
  DisplacementProjectTableComponent,
  MatchOrderDialogModule,
  OrderMatchModule,
} from './components';
import { DisplacementProjectsComponent } from './displacement-projects.component';
import { DisplacementProjectsRouting } from './displacement-projects.routing';

const MaterialModules = [MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatDialogModule];

@NgModule({
  declarations: [DisplacementProjectsComponent, DisplacementProjectTableComponent],
  imports: [
    BadgeModule,
    ColumnSorterModule,
    CommonModule,
    DisplacementProjectModule,
    DisplacementProjectsRouting,
    DivideDigitsModule,
    DriverModule,
    FlagSwitchModule,
    FlightCancelModule,
    FlightDetailsDialogModule,
    FlightStatusModule,
    FormsModule,
    MatchOrderDialogModule,
    ...MaterialModules,
    OrderMatchModule,
    PlainAutocompleteModule,
    PlainSelectModule,
    ReactiveFormsModule,
    TrailerModule,
    VehicleModule,
    VehicleStateModule,
  ],
})
export class DisplacementProjectsModule {}
