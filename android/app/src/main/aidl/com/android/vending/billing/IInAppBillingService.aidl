// رابط پرداخت درون‌برنامه‌ای نسخه‌ی ۳؛ کافه‌بازار و مایکت هر دو همین رابط را پیاده کرده‌اند.
// ترتیب متدها نباید عوض شود.
package com.android.vending.billing;

import android.os.Bundle;

interface IInAppBillingService {
    int isBillingSupported(int apiVersion, String packageName, String type);
    Bundle getSkuDetails(int apiVersion, String packageName, String type, in Bundle skusBundle);
    Bundle getBuyIntent(int apiVersion, String packageName, String sku, String type, String developerPayload);
    Bundle getPurchases(int apiVersion, String packageName, String type, String continuationToken);
    int consumePurchase(int apiVersion, String packageName, String purchaseToken);
}
