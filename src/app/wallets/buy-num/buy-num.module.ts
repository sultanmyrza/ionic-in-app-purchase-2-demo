import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BuyNumPageRoutingModule } from './buy-num-routing.module';
import { BuyNumPage } from './buy-num.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, BuyNumPageRoutingModule],
  declarations: [BuyNumPage],
})
export class BuyNumPageModule {}
