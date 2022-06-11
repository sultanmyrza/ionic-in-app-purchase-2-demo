import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BuyNumSimplePageRoutingModule } from './buy-num-simple-routing.module';

import { InAppPurchase2 } from '@awesome-cordova-plugins/in-app-purchase-2/ngx';
import { BuyNumSimplePage } from './buy-num-simple.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BuyNumSimplePageRoutingModule
  ],
  declarations: [BuyNumSimplePage],
  providers:[InAppPurchase2]
})
export class BuyNumSimplePageModule {}
