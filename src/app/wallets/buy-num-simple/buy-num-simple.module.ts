import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BuyNumSimplePageRoutingModule } from './buy-num-simple-routing.module';

import { BuyNumSimplePage } from './buy-num-simple.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BuyNumSimplePageRoutingModule
  ],
  declarations: [BuyNumSimplePage]
})
export class BuyNumSimplePageModule {}
