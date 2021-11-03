import { BehaviorSubject, combineLatest, Observable, OperatorFunction, pipe } from 'rxjs';
import { map, shareReplay, skip, startWith, switchMap } from 'rxjs/operators';

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PrivateOfficeRoutes } from '@core/private-office/routing';
import { SortDirection, SortParams } from '@domains/common/models';
import { DisplacementProjectService, ProjectMapper } from '@domains/displacement-project';
import {
  DisplacementProject,
  DisplacementProjectSearchParams as SearchParams,
  ProjectTableRow as TableRow,
} from '@domains/displacement-project/models';
import { Order } from '@domains/order/models';
import { FlightCancelService } from '@shared/dialog/flight-cancel';
import { FlightDetailsService } from '@shared/dialog/flight-details-dialog';
import { SelectOption } from '@shared/inputs/models';
import {
  mix,
  mixinArchiveItem,
  mixinAutoUnsubscribe,
  mixinHandleEvents,
  mixinShowDetails,
} from '@shared/mixins';

import { OrderMatchService } from './components/match-order';
import { Brigade } from './components/match-order/models';
import { projectConformStrategies as conformStrategies } from './conform-strategies';
import { ProjectFilterFlag as Flag } from './models';

const { toTable } = ProjectMapper;

type ProjectSortParams = SortParams<Pick<Order, 'startDate'>>;

const INITIAL_SORT_PARAMS: ProjectSortParams = {
  sortField: 'startDate',
  sortDirection: SortDirection.ASC,
};

const displacementProjectFilterFlags: SelectOption<Flag>[] = [
  { value: Flag.ALL, title: 'Все рейсы' },
  { value: Flag.ONLY_CURRENT, title: 'Только с текущим рейсом' },
  { value: Flag.IDLE, title: 'Без рейсов' },
];

class Base {
  constructor(
    readonly detailsService: FlightDetailsService,
    readonly archivingConfirmationService: FlightCancelService,
  ) {}
}

const MixinBase = mix(Base, [
  mixinAutoUnsubscribe,
  mixinHandleEvents,
  mixinShowDetails,
  mixinArchiveItem,
]);

@Component({
  selector: 'app-current-flights',
  templateUrl: 'displacement-projects.component.html',
  styleUrls: ['displacement-projects.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplacementProjectsComponent extends MixinBase {
  public projects: Observable<TableRow[]>;
  public searchFlags: SelectOption<Flag>[] = displacementProjectFilterFlags;

  protected readonly sort: BehaviorSubject<ProjectSortParams> = new BehaviorSubject(INITIAL_SORT_PARAMS);

  private readonly projectSearch = new BehaviorSubject<SearchParams>({});
  private readonly flagSwitch = new BehaviorSubject<Flag>(Flag.ALL);

  public get flag(): Flag {
    return this.flagSwitch.getValue();
  }
  public set flag(value: Flag) {
    this.flagSwitch.next(value);
  }

  constructor(
    private readonly projectService: DisplacementProjectService,
    private readonly matchService: OrderMatchService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    detailsService: FlightDetailsService,
    flightCancelService: FlightCancelService,
  ) {
    super(detailsService, flightCancelService);
    this.projects = this.getTableData();
    this.observePickDataChanges();
  }

  startSearch(searchParams: SearchParams): void {
    this.projectSearch.next(searchParams);
  }

  matchOrder(brigade: Brigade): void {
    this.matchService.changePickData({ brigade });
  }

  private observePickDataChanges(): void {
    const subscription = this.matchService.pickDataChanges
      .pipe(skip(1))
      .subscribe(() => this.goToMatchList());

    this._subscriptions.add(subscription);
  }

  private getTableData(): Observable<TableRow[]> {
    const projects = this.getProjects();

    const rows = projects.pipe(map(toTable));

    const conformedRows = rows.pipe(this.takeConform());

    return conformedRows;
  }

  private takeConform(): OperatorFunction<TableRow[], TableRow[]> {
    return pipe(
      switchMap((rows) =>
        this.flagSwitch.pipe(
          map((flag) => {
            const isConformed = conformStrategies[flag];
            return rows.filter(isConformed);
          }),
        ),
      ),
    );
  }

  private getProjects(): Observable<DisplacementProject[]> {
    const filter = combineLatest([this.projectSearch, this.sort]).pipe(
      map(([searchParams, sortParams]) => {
        const filterParams = { ...sortParams };
        return { ...searchParams, filterParams };
      }),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    const projects = this.archivingConfirmationActions.pipe(
      startWith(''),
      switchMap(() => filter),
      switchMap((filter) => this.projectService.getByFilter(filter)),
      map(({ projects }) => projects),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    return projects;
  }

  private goToMatchList(): void {
    const route = PrivateOfficeRoutes.DisplacementProject.matchOrder;
    this.router.navigate([route], { relativeTo: this.activatedRoute.parent });
  }
}
