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
  readonly inAppProducts$ = this.store.inAppProducts$.pipe(
    tap((_) => this.ref.detectChanges())
  );

  readonly totalProducts = this.store.inAppProducts$.pipe(
    map((products) => products.length)
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
