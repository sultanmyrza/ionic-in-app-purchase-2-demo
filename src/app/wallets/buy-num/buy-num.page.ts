import { ChangeDetectorRef, Component } from '@angular/core';
import {
  IAPError,
  IAPProduct,
  InAppPurchase2
} from '@awesome-cordova-plugins/in-app-purchase-2/ngx';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-buy-num',
  templateUrl: './buy-num.page.html',
  styleUrls: ['./buy-num.page.scss'],
})
export class BuyNumPage {
  fetchingProductsWithNumpoints = true;

  myNumPoints = 0;

  purchaseActivity: InAppProductsWithNumPoints[] = [];

  inAppProducts$ = new BehaviorSubject<IAPProduct[]>([]);

  numPointsPrices$ = new BehaviorSubject<NumPointPrice[]>([]);

  inAppProductsWithNumPoints$ = combineLatest([
    this.inAppProducts$,
    this.numPointsPrices$,
  ]).pipe(
    map(([inAppProducts, numPointPriceList]) => {
      // Basic mapping to generate InAppProductsWithNumPoints
      const result: InAppProductsWithNumPoints[] = [];

      for (const inAppProduct of inAppProducts) {
        for (const item of numPointPriceList) {
          if (inAppProduct.id === item.inAppPurchaseId) {
            result.push({ inAppProduct, numPoints: item.quantity });
          }
        }
      }

      return result;
    }),
    tap(() => (this.fetchingProductsWithNumpoints = false))
  );

  constructor(
    private readonly platform: Platform,
    private readonly store: InAppPurchase2,
    private readonly ref: ChangeDetectorRef
  ) {
    this.initStore();
  }

  async initStore() {
    await this.platform.ready();
    // this.registerStoreListeners()
    this.store.verbosity = this.store.DEBUG;
    this.store.ready(this.onStoreReady.bind(this));
    this.fetchInAppProducts();
    this.fetchNumPointsPriceList();
  }

  registerStoreListeners() {
    this.store
      .when('product')
      .cancelled(this.onStoreProductCanceled.bind(this))
      .approved(this.onStoreProductApproved.bind(this))
      .verified(this.onStoreProductVerified.bind(this))
      .finished(this.onStoreProductFinished.bind(this))
      .error(this.onStoreProductError.bind(this));
  }

  unregisterStoreListeners() {
    this.store.off(this.onStoreReady.bind(this));
    this.store.off(this.onStoreProductCanceled.bind(this));
    this.store.off(this.onStoreProductApproved.bind(this));
    this.store.off(this.onStoreProductVerified.bind(this));
    this.store.off(this.onStoreProductFinished.bind(this));
    this.store.off(this.onStoreProductError.bind(this));
  }

  registerProducts() {
    const registeredProductsById = this.store.products.byId;
    const consumeableProductIds = [
      CaptureInAppProductIds.BRONZE_PACK,
      CaptureInAppProductIds.SLIVER_PACK,
      CaptureInAppProductIds.GOLD_PACK,
      CaptureInAppProductIds.PLATINUM_PACK,
    ];

    let shoudlRefreshStore = false;
    for (const id of consumeableProductIds) {
      if (!(id in registeredProductsById)) {
        this.store.register({ id, type: this.store.CONSUMABLE });
        shoudlRefreshStore = true;
      }
    }

    if (shoudlRefreshStore) {
      this.debug(`shouldRefershStore`, shoudlRefreshStore);
      this.registerStoreListeners();
      this.fetchInAppProducts();
    }
  }

  onStoreProductCanceled(product: IAPProduct) {
    this.debug('onStoreProductCanceled', product);
  }

  onStoreProductApproved(product: IAPProduct) {
    if (product.id === 'io.ionic.starter') {
      return;
    }

    this.debug(`onStoreProductApproved`, product);
    return product.verify();
  }

  onStoreProductVerified(inAppProduct: IAPProduct) {
    if (inAppProduct.id === 'io.ionic.starter') {
      return;
    }

    // Do Bussiness Logic When user make an in-app purchase
    const numPointPrice = this.numPointsPrices$.value.find(
      (i) => i.inAppPurchaseId === inAppProduct.id
    );
    if (numPointPrice) {
      const numPoints = numPointPrice.quantity;
      this.myNumPoints += numPoints;
      this.purchaseActivity.push({ inAppProduct, numPoints });
      this.ref.detectChanges();
      alert(`Added ${numPointPrice.quantity} points`);
    } else {
      alert('numPointPrice not found, can not add num points');
      // TODO: alert user that we fail to add num points
    }

    this.debug(`onStoreProductVerified`, inAppProduct);
    inAppProduct.finish();
  }

  onStoreProductFinished(product: IAPProduct) {
    if (product.id === 'io.ionic.starter') {
      return;
    }

    this.debug('onStoreProductFinished', product);
  }

  onStoreProductError(error: IAPError) {
    this.debug('onStoreProductError', error);
  }

  onStoreReady() {
    this.debug(`onStoreReady`, this.store.products);
    this.registerProducts();
    return this.inAppProducts$.next(this.store.products);
  }

  fetchInAppProducts() {
    this.debug(`fetchInAppProducts`);
    this.fetchingProductsWithNumpoints = true;
    this.store.refresh();
  }

  async fetchNumPointsPriceList() {
    this.debug('fetchNumPointsPriceList');
    await new Promise((res) => setTimeout(res, 2000));
    const priceListFromRestApi = [
      {
        id: 1,
        quantity: 30,
        inAppPurchaseId: 'cap_lite_consumable_bronze_pack_099',
      },
      {
        id: 2,
        quantity: 60,
        inAppPurchaseId: 'cap_lite_consumable_silver_pack_199',
      },
      {
        id: 3,
        quantity: 90,
        inAppPurchaseId: 'cap_lite_consumable_gold_pack_299',
      },
      {
        id: 4,
        quantity: 120,
        inAppPurchaseId: 'cap_lite_consumable_platinum_pack_399',
      },
    ];
    this.numPointsPrices$.next(priceListFromRestApi);
  }

  purchase(inAppProductWithNumPoints: InAppProductsWithNumPoints) {
    const { inAppProduct } = inAppProductWithNumPoints;

    this.store.order(inAppProduct).then(
      (p: IAPProduct) => {
        // Purchase in progress
        this.debug(`store.order(inAppProduct).then()`, p);
      },
      (e: any) => {
        this.debug(`store.order(inAppProduct).then()`, e);
        alert(`Failed ${e}`);
      }
    );
  }

  private debug(message: string, data?: any) {
    const tag = 'BuyNumPage';
    console.log(`${tag}: ${message}`);

    if (data) {
      console.log(`${JSON.stringify(data)}`);
    }
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

export enum CaptureInAppProductIds {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  BRONZE_PACK = 'cap_lite_consumable_bronze_pack_099',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  SLIVER_PACK = 'cap_lite_consumable_silver_pack_199',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  GOLD_PACK = 'cap_lite_consumable_gold_pack_299',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  PLATINUM_PACK = 'cap_lite_consumable_platinum_pack_399',
}
