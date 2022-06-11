import { ChangeDetectorRef, Component } from '@angular/core';
import { IAPProduct } from '@awesome-cordova-plugins/in-app-purchase-2/ngx';
import { map, tap } from 'rxjs/operators';
import { StoreService } from 'src/app/shared/store/store.service';

@Component({
  selector: 'app-buy-num',
  templateUrl: './buy-num.page.html',
  styleUrls: ['./buy-num.page.scss'],
})
export class BuyNumPage {
  readonly inAppProducts$ = this.store.inAppProductsWithNumpoints$.pipe(
    tap((_) => this.ref.detectChanges())
  );

  readonly totalProducts = this.store.inAppProductsWithNumpoints$.pipe(
    map((products) => products.length),
    tap((_) => this.ref.detectChanges())
  );

  readonly numPoints$ = this.store.numPoints$;

  constructor(
    private readonly store: StoreService,
    private readonly ref: ChangeDetectorRef
  ) {}

  purchase(product: IAPProduct) {
    this.store.purchase(product);
  }

  async resetNumPoints() {
    this.store.debugOnlyResetNumPoints();
  }
}
