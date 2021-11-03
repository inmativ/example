import { ControlsConfig } from '@shared/extended-form/models';
import { LocationValidators } from '@shared/inputs/location/validators';
import { MomentValidators } from '@shared/inputs/moment';

import { OrderMatchParams } from '../models';

export function getOrderMatchFormConfig(
  matchParams: OrderMatchParams = {},
): ControlsConfig<OrderMatchParams> {
  const { startLocation = null, startDate = null, endLocation = null } = matchParams;
  const config: ControlsConfig<OrderMatchParams> = {
    startLocation: [startLocation, [LocationValidators.region]],
    startDate: [startDate, [MomentValidators.future]],
    endLocation,
  };
  return config;
}
