import { ChangeDetectorRef, Component } from '@angular/core';
import {
  IAPError,
  IAPProduct
} from '@awesome-cordova-plugins/in-app-purchase-2';
import { InAppPurchase2 } from '@awesome-cordova-plugins/in-app-purchase-2/ngx';
import { Platform } from '@ionic/angular';
import { getNumPoints, setNumPoints, setupDebugPrint } from 'src/app/app.utils';
import { CaptureInAppProductIds } from 'src/app/shared/store/store.service';

@Component({
  selector: 'app-buy-num-simple',
  templateUrl: './buy-num-simple.page.html',
  styleUrls: ['./buy-num-simple.page.scss'],
})
export class BuyNumSimplePage {
  consumableProduct?: IAPProduct;
  numPoints = 0;

  private readonly debugPrint = setupDebugPrint('BuyNumSimplePage');
  private readonly productId = CaptureInAppProductIds.BRONZE_PACK;
  private readonly productAlias = 'bronze_pack';

  constructor(
    private readonly platform: Platform,
    private readonly store: InAppPurchase2,
    private readonly ref: ChangeDetectorRef
  ) {}

  ionViewDidEnter() {
    this.initStore();
  }

  ionViewDidLeave() {
    this.unregisterStoreListeners();
  }

  initStore() {
    if (this.isNativePlatform() === false) {
      return;
    }

    this.store.verbosity = this.store.INFO;

    // registering single product
    this.store.register({
      id: this.productId,
      alias: this.productAlias,
      type: this.store.CONSUMABLE,
    });

    // TODO: remove logs
    console.log(`initStore() -> register products`);
    console.log(`productID: ${this.productId}`);
    console.log(`productAlias: ${this.productAlias}`);

    this.registerStoreListeners();
    this.refreshNumPointsUI();

    this.store.refresh();
  }

  purchaseConsumable() {
    this.debugPrint('purchaseConsumable', this.consumableProduct);

    this.store.order(this.productId);
  }

  private refreshNumPointsUI = async () => {
    this.numPoints = await getNumPoints();
    this.ref.detectChanges();
  };

  private refreshProductUI = (product: IAPProduct) => {
    this.consumableProduct = product;
    this.ref.detectChanges(); // Update UI changes
  };

  private finishPurchase = (product: IAPProduct) => {
    setNumPoints(this.numPoints + 10);
    product.finish();
    this.refreshNumPointsUI();
  };

  private registerStoreListeners() {
    this.debugPrint('registerStoreListeners');

    this.store.error(this.onStoreError);
    this.store.ready(this.onStoreReady);
    this.store.when(this.productId).updated(this.onStoreProductUpdated);
    this.store.when(this.productId).approved(this.onStoreProductApproved);
    this.store.when(this.productId).verified(this.onStoreProductVerified);
  }

  private unregisterStoreListeners() {
    this.debugPrint('unregisterStoreListeners');

    this.store.off(this.onStoreError);
    this.store.off(this.onStoreReady);
    this.store.off(this.onStoreProductUpdated);
    this.store.off(this.onStoreProductApproved);
    this.store.off(this.onStoreProductVerified);
  }

  private onStoreError = (error: IAPError) => {
    this.debugPrint('onStoreError', error);
  };

  private onStoreReady = () => {
    this.debugPrint(`onStoreReady`, this.store.products);
  };

  private onStoreProductUpdated = (product: IAPProduct) => {
    this.debugPrint('onStoreProductUpdated', product);

    if (product.id === 'io.ionic.starter') {
      return;
    }

    this.refreshProductUI(product);
  };

  private onStoreProductApproved = (product: IAPProduct) => {
    if (product.id === 'io.ionic.starter') {
      return;
    }

    this.debugPrint(`onStoreProductApproved`, product);

    return product.verify();
  };

  private onStoreProductVerified = (product: IAPProduct) => {
    if (product.id === 'io.ionic.starter') {
      return;
    }

    this.debugPrint('onStoreProductVerified', product);

    this.finishPurchase(product);
  };

  private isNativePlatform() {
    return this.platform.is('ios') || this.platform.is('android');
  }
}
