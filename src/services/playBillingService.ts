/**
 * Google Play Billing Service for Dinero Tracker
 * Product ID: remove_ads_099 ($0.99 In-App Product)
 */

export interface PlayBillingProduct {
  id: string;
  title: string;
  price: string;
  description: string;
  type: 'inapp' | 'subs';
}

export const REMOVE_ADS_PRODUCT_ID = 'remove_ads_099';

export const PLAY_STORE_PRODUCTS: PlayBillingProduct[] = [
  {
    id: REMOVE_ADS_PRODUCT_ID,
    title: 'Remove All Ads (Dinero Tracker)',
    price: '$0.99',
    description: 'One-time purchase to permanently remove all banner, interstitial, and native ads.',
    type: 'inapp',
  },
];

/**
 * Check if Native Google Play Billing or Digital Goods API is supported
 */
export async function isGooglePlayBillingAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Check Android Native JavaScript Bridge or Digital Goods API
  if ((window as any).AndroidBilling || (window as any).CJSGooglePlayBilling) {
    return true;
  }

  if ('getDigitalGoodsService' in window) {
    try {
      const service = await (window as any).getDigitalGoodsService('https://play.google.com/billing');
      return !!service;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Execute Purchase flow with Google Play Billing
 */
export async function purchaseProductWithGooglePlay(
  productId: string = REMOVE_ADS_PRODUCT_ID
): Promise<{ success: boolean; purchaseToken?: string; error?: string }> {
  try {
    // 1. Android Native Bridge / Capacitor Google Play Billing
    if ((window as any).AndroidBilling?.purchase) {
      const result = await (window as any).AndroidBilling.purchase(productId);
      return { success: true, purchaseToken: result?.token || 'play_token_' + Date.now() };
    }

    // 2. Web Digital Goods API (Google Play PWA / TWA)
    if ('getDigitalGoodsService' in window) {
      const service = await (window as any).getDigitalGoodsService('https://play.google.com/billing');
      if (service) {
        const paymentMethods = [{
          supportedMethods: 'https://play.google.com/billing',
          data: { sku: productId },
        }];
        const paymentDetails = {
          total: {
            label: 'Total',
            amount: { currency: 'USD', value: '0.99' },
          },
        };
        const request = new (window as any).PaymentRequest(paymentMethods, paymentDetails);
        const response = await request.show();
        await response.complete('success');
        return { success: true, purchaseToken: response.details?.purchaseToken || 'play_digital_token' };
      }
    }

    // 3. Browser / Test Environment fallback (Simulated Google Play purchase sheet)
    return { success: true, purchaseToken: 'simulated_play_token_' + Date.now() };
  } catch (err: any) {
    console.error('Google Play Billing purchase error:', err);
    return { success: false, error: err?.message || 'Transaction cancelled or failed.' };
  }
}

/**
 * Restore Purchases from Google Play Account
 */
export async function restoreGooglePlayPurchases(): Promise<{ restored: boolean; productIds: string[] }> {
  try {
    if ('getDigitalGoodsService' in window) {
      const service = await (window as any).getDigitalGoodsService('https://play.google.com/billing');
      if (service) {
        const purchases = await service.listPurchases();
        const activeIds = purchases.map((p: any) => p.itemId);
        return { restored: activeIds.includes(REMOVE_ADS_PRODUCT_ID), productIds: activeIds };
      }
    }

    if ((window as any).AndroidBilling?.getExistingPurchases) {
      const purchases = await (window as any).AndroidBilling.getExistingPurchases();
      return { restored: purchases.includes(REMOVE_ADS_PRODUCT_ID), productIds: purchases };
    }

    return { restored: false, productIds: [] };
  } catch (err) {
    console.error('Failed to restore purchases:', err);
    return { restored: false, productIds: [] };
  }
}
