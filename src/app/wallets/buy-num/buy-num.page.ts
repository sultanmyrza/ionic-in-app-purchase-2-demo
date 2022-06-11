import { ChangeDetectorRef, Component } from '@angular/core';
import { IAPProduct } from '@awesome-cordova-plugins/in-app-purchase-2/ngx';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StoreService } from 'src/app/shared/store/store.service';

@Component({
  selector: 'app-buy-num',
  templateUrl: './buy-num.page.html',
  styleUrls: ['./buy-num.page.scss'],
})
export class BuyNumPage {
  readonly inAppProducts$ = this.store.inAppProducts$.pipe(
    tap((_) => {
      this.ref.detectChanges();
    })
  );
  readonly numPoints$ = this.store.numPoints$;

  // Deprecated field
  purchaseActivity: InAppProductsWithNumPoints[] = [];
  numPointsPrices$ = new BehaviorSubject<NumPointPrice[]>([]);

  constructor(
    private readonly store: StoreService,
    private readonly ref: ChangeDetectorRef
  ) {}

  purchase(product: IAPProduct) {
    this.store.purchase(product);
  }
}

interface NumPointPrice {
  id: number;
  quantity: number;
  inAppPurchaseId: string;
}

interface InAppProductsWithNumPoints {
  inAppProduct: IAPProduct;
  numPoints: number;
}
