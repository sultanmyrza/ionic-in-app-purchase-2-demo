import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InAppPurchase2 } from '@awesome-cordova-plugins/in-app-purchase-2/ngx';
import { IonicModule } from '@ionic/angular';
import { BuyNumPageRoutingModule } from './buy-num-routing.module';
import { BuyNumPage } from './buy-num.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, BuyNumPageRoutingModule],
  declarations: [BuyNumPage],
  providers: [InAppPurchase2],
})
export class BuyNumPageModule {}
