import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WalletsPage } from './wallets.page';

const routes: Routes = [
  {
    path: '',
    component: WalletsPage,
  },
  {
    path: 'buy-num',
    loadChildren: () =>
      import('./buy-num/buy-num.module').then((m) => m.BuyNumPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WalletsPageRoutingModule {}
