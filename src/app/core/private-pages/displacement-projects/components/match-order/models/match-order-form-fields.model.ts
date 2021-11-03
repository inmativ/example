import { DateRFC3339 } from '@domains/common/models';
import { Driver } from '@domains/driver/models';
import { Flight } from '@domains/flight/models';
import { OrderMatchData } from '@domains/order/models';
import { Trailer } from '@domains/trailer/models';
import { Vehicle } from '@domains/vehicle/models';
import { Location } from '@shared/models';
import { SelectivePartial, SelectiveRequired } from '@shared/utils';

export type Brigade = {
  id?: string;

  vehicleId: string;
  trailerId?: string;
  driverId?: string;
};

export type BrigadeFormFields = {
  vehicleId: Vehicle['id'];
  trailerId: Trailer['id'];
  driverId: Driver['userId'];
};

export type BrigadeUpdate = {
  id?: Flight['id'];
  vehicleId: Vehicle['id'];
  trailerId: Trailer['id'];
  driverId: Driver['userId'];
};

export type SavedBrigade = Required<Brigade>;

export type OrderMatchParams = {
  startLocation?: Location;
  startDate?: DateRFC3339;
  endLocation?: Location;
};

export type OrderMatchParamsFormFields = OrderMatchParams;

type SavableFields = 'driverId' | 'id' | 'trailerId';

/** @deprecated */
export type DeprecatedOrderMatchData = SelectivePartial<OrderMatchData & Brigade, SavableFields>;

export type OrderPickDataBlank = { brigade: Brigade; matchParams?: OrderMatchParams };

export type OrderPickData = { brigade: SavedBrigade; matchParams?: OrderMatchParams };

/** @deprecated */
export type FilledOrderMatchData = SelectiveRequired<DeprecatedOrderMatchData, SavableFields>;
