import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { PrivateOfficeRoutes } from '@core/private-office/routing';

import { OrderMatchComponent } from './components/match-order/order-match.component';
import { DisplacementProjectsComponent } from './displacement-projects.component';

const routes: Route[] = [
  {
    path: PrivateOfficeRoutes.DisplacementProject.matchOrder,
    component: OrderMatchComponent,
  },
  {
    path: '',
    component: DisplacementProjectsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DisplacementProjectsRouting {}
