import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BuyNumSimplePage } from './buy-num-simple.page';

const routes: Routes = [
  {
    path: '',
    component: BuyNumSimplePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BuyNumSimplePageRoutingModule {}
