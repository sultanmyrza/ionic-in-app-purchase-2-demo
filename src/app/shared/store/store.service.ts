import { Injectable, OnDestroy } from '@angular/core';
import {
  IAPError,
  IAPProduct,
  InAppPurchase2
} from '@awesome-cordova-plugins/in-app-purchase-2/ngx';
import { Platform, ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { getNumPoints, setNumPoints, setupDebugPrint } from 'src/app/app.utils';

@Injectable({
  providedIn: 'root',
})
export class StoreService implements OnDestroy {
  readonly debugPrint = setupDebugPrint('StoreService');

  readonly numPoints$ = new BehaviorSubject<number>(0);

  readonly inAppProducts$ = new BehaviorSubject<IAPProduct[]>([]);

  readonly inAppProductsWithNumpoints$ = this.inAppProducts$.pipe(
    map((products) => {
      const result = products.map((product) => ({
        numPoints: this.pointsForProduct(product),
        inAppProduct: product,
      }));
      return result;
    })
  );

  private numPriceListById: { [id: string]: NumPointPrice };

  // inAppProductsWithNumPoints$ = combineLatest([
  //   this.inAppProducts$,
  //   this.numPointsPrices$,
  // ]).pipe(
  //   map(([inAppProducts, numPointPriceList]) => {
  //     // Basic mapping to generate InAppProductsWithNumPoints
  //     const result: InAppProductsWithNumPoints[] = [];

  //     for (const inAppProduct of inAppProducts) {
  //       for (const item of numPointPriceList) {
  //         if (inAppProduct.id === item.inAppPurchaseId) {
  //           result.push({ inAppProduct, numPoints: item.quantity });
  //         }
  //       }
  //     }

  //     return result;
  //   }),
  //   tap(() => (this.fetchingProductsWithNumpoints = false))
  // );

  constructor(
    private readonly store: InAppPurchase2,
    private readonly platform: Platform,
    private readonly toastController: ToastController
  ) {}

  async init() {
    if (this.isNativePlatform() === false) {
      return;
    }

    try {
      this.debugPrint('init');
      this.notifyUser('Initializing store');
      // TODO: get AppID
      this.numPoints$.next(await getNumPoints());

      await this.refreshNumPointsPricing();

      await this.platform.ready();

      this.regiseterListeners();
      this.registerProducts();

      this.store.refresh();
    } catch (error) {
      this.notifyUser('Failed to init store');
    }
  }

  ngOnDestroy(): void {
    this.debugPrint('ngOnDestroy');
    this.unregisterListeners();
  }

  purchase(product: IAPProduct) {
    this.store.order(product);
  }

  async debugOnlyResetNumPoints() {
    // For debuggin purposes only
    await setNumPoints(0);
    this.numPoints$.next(0);
    await this.notifyUser(`Num points are reset 🚀`);
  }

  private async finishPurchase(product: IAPProduct) {
    const pointsToAdd = this.pointsForProduct(product);
    await this.addPoints(pointsToAdd);
    product.finish();
  }

  private async addPoints(pointsToAdd: number) {
    const currPoints = await getNumPoints();
    const points = currPoints + pointsToAdd;
    await setNumPoints(points);
    this.numPoints$.next(points);
    await this.notifyUser(`Added ${pointsToAdd} points 🎉`);
  }

  private registerProducts() {
    const consumableProductIds = [
      CaptureInAppProductIds.BRONZE_PACK,
      CaptureInAppProductIds.SLIVER_PACK,
      CaptureInAppProductIds.GOLD_PACK,
      CaptureInAppProductIds.PLATINUM_PACK,
    ];
    const type = this.store.CONSUMABLE;

    for (const id of consumableProductIds) {
      this.store.register({ id, type });
    }
  }

  private regiseterListeners() {
    this.debugPrint('regiseterListeners');

    this.store.error(this.onStoreError);
    this.store.ready(this.onStoreReady);
    this.store.when('product').approved(this.onStoreProductApproved);
    this.store.when('product').updated(this.onStoreProductUpdated);
    this.store.when('product').verified(this.onStoreProductVerified);
  }

  private unregisterListeners() {
    this.debugPrint('unregisterListeners');

    this.store.off(this.onStoreError);
    this.store.off(this.onStoreReady);
    this.store.off(this.onStoreProductApproved);
    this.store.off(this.onStoreProductUpdated);
    this.store.off(this.onStoreProductVerified);
  }

  private onStoreError = (error: IAPError) => {
    this.debugPrint('onStoreError', error);
  };

  private onStoreReady = () => {
    this.debugPrint('onStoreReady');

    const inAppProducts = this.store.products.filter(
      (product) => this.shouldIgnoreProduct(product) === false
    );
    this.debugPrint('products (exclude ignored ones)', inAppProducts);

    this.inAppProducts$.next(inAppProducts);
    this.notifyUser('Products loaded');
  };

  private onStoreProductUpdated = (updatedProduct: IAPProduct) => {
    if (this.shouldIgnoreProduct(updatedProduct)) {
      return;
    }

    this.debugPrint('onStoreProductUpdated', updatedProduct);

    const inAppProducts = this.inAppProducts$.value.map((product) =>
      product.id === updatedProduct.id ? updatedProduct : product
    );

    this.inAppProducts$.next(inAppProducts);
  };

  private onStoreProductApproved = (product: IAPProduct) => {
    if (this.shouldIgnoreProduct(product)) {
      return;
    }

    this.debugPrint('onStoreProductApproved', product);

    // TODO: verification logic probably call to backend

    product.verify();
  };

  private onStoreProductVerified = (product: IAPProduct) => {
    if (this.shouldIgnoreProduct(product)) {
      return;
    }

    this.debugPrint('onStoreProductVerified', product);

    this.finishPurchase(product);
  };

  private isNativePlatform() {
    return this.platform.is('hybrid');
  }

  private shouldIgnoreProduct(product: IAPProduct) {
    // TODO: get app id dynamically
    return product.id === 'io.ionic.starter';
  }

  private pointsForProduct(product: IAPProduct) {
    return this.numPriceListById[product.id]?.quantity ?? 0;
  }

  private async notifyUser(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 1000,
    });
    toast.present();
  }

  private async refreshNumPointsPricing() {
    this.debugPrint('fetchNumPointsPriceList');
    // TODO: fetch from server
    await new Promise((res) => setTimeout(res, 2000));
    const priceListFromRestApi = [
      {
        id: 1,
        quantity: 30,
        inAppPurchaseId: 'cap_lite_consumable_bronze_pack_099',
        updatedAt: new Date(),
      },
      {
        id: 2,
        quantity: 60,
        inAppPurchaseId: 'cap_lite_consumable_silver_pack_199',
        updatedAt: new Date(),
      },
      {
        id: 3,
        quantity: 90,
        inAppPurchaseId: 'cap_lite_consumable_gold_pack_299',
        updatedAt: new Date(),
      },
      {
        id: 4,
        quantity: 120,
        inAppPurchaseId: 'cap_lite_consumable_platinum_pack_399',
        updatedAt: new Date(),
      },
    ];
    const priceListById: { [id: string]: NumPointPrice } = {};
    priceListFromRestApi.forEach((item) => {
      priceListById[item.inAppPurchaseId] = item;
    });
    this.numPriceListById = priceListById;
  }
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

interface NumPointPrice {
  id: number;
  quantity: number;
  inAppPurchaseId: string;
  updatedAt: Date;
}

interface InAppProductsWithNumPoints {
  inAppProduct: IAPProduct;
  numPoints: number;
}
