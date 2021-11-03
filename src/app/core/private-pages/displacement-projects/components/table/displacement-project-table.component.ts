import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ProjectTableRow as TableRow } from '@domains/displacement-project/models';
import { Act, DetailAction } from '@shared/models';

import { Brigade } from '../match-order/models';

type ProjectVehicle = TableRow['vehicle'];
type ProjectFlights = TableRow['flights'];
type CurrentFlight = ProjectFlights[0];
type ComingFlight = ProjectFlights[1];
type ProjectFlight = CurrentFlight | ComingFlight;
type Button = CurrentFlight['button'];

@Component({
  selector: 'app-displacement-project-table',
  templateUrl: 'displacement-project-table.component.html',
  styleUrls: ['displacement-project-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplacementProjectTableComponent {
  @Input() projects: TableRow[] | null = [];
  @Output() orderMatch = new EventEmitter<Brigade>();
  @Output() detailsShow = new EventEmitter<DetailAction>();

  public columns = [
    { title: 'Текущий рейс', sortField: 'currentFlight' },
    { title: 'Предстоящий рейс', sortField: 'nextFlight' },
  ];

  private readonly actions: Record<
    Button['action'],
    (vehicle: ProjectVehicle, flight: ProjectFlight) => void
  > = {
    details: (vehicle, { id = '', ...flight }) =>
      this.detailsShow.emit({ type: Act.DETAILS, id, ...flight }),
    pick: (vehicle, flight) => this.pickOrder(vehicle, flight),
  };

  handleButtonClick(action: Button['action'], vehicle: ProjectVehicle, flight: ProjectFlight): void {
    const handle = this.actions[action];
    handle(vehicle, flight);
  }

  private pickOrder(vehicle: ProjectVehicle, { id, trailer, driver }: ProjectFlight): void {
    const blankFlight = {
      id,
      vehicleId: vehicle.id,
      trailerId: trailer?.id,
      driverId: driver?.userId,
    };
    this.orderMatch.emit(blankFlight);
  }
}
