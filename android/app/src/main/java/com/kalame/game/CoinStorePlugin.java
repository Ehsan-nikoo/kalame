package com.kalame.game;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;
import android.os.RemoteException;
import android.util.Base64;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.IntentSenderRequest;
import androidx.activity.result.contract.ActivityResultContracts;

import com.android.vending.billing.IInAppBillingService;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;
import org.json.JSONObject;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * فروشگاه سکه: پرداخت درون‌برنامه‌ای کافه‌بازار یا مایکت (بسته به نسخه‌ی ساخته‌شده).
 * هر دو فروشگاه رابط IInAppBillingService نسخه‌ی ۳ را دارند؛ فقط نشانی سرویس و کلید عمومی فرق می‌کند
 * که از BuildConfig (تنظیمات flavor در app/build.gradle) خوانده می‌شود.
 *
 * روند خرید: buy ← فروشگاه پول را می‌گیرد ← امضای خرید با کلید عمومی بررسی می‌شود ← بازی سکه را
 * اضافه و ذخیره می‌کند ← consume تا همان بسته دوباره قابل خرید باشد.
 * اگر بازی وسط کار بسته شود، pending خریدهای مصرف‌نشده را برمی‌گرداند تا سکه‌اش داده شود.
 */
@CapacitorPlugin(name = "CoinStore")
public class CoinStorePlugin extends Plugin {

    private static final int API = 3;
    private static final String INAPP = "inapp";

    // کدهای پاسخ فروشگاه
    private static final int OK = 0;
    private static final int USER_CANCELED = 1;
    private static final int ITEM_ALREADY_OWNED = 7;

    private IInAppBillingService service;
    private ServiceConnection connection;
    private ActivityResultLauncher<IntentSenderRequest> buyLauncher;
    private PluginCall buyCall;
    private String buyPayload;

    @Override
    public void load() {
        buyLauncher = getActivity().registerForActivityResult(
            new ActivityResultContracts.StartIntentSenderForResult(), this::onBuyResult);
    }

    @Override
    protected void handleOnDestroy() {
        if (connection != null) {
            try {
                getContext().unbindService(connection);
            } catch (Exception ignored) {
            }
        }
        connection = null;
        service = null;
    }

    // ---------- اتصال به سرویس فروشگاه ----------

    /** در صورت نیاز به سرویس وصل می‌شود؛ روی رشته‌ی پلاگین اجرا می‌شود، نه رشته‌ی اصلی. */
    private synchronized IInAppBillingService connect() {
        if (service != null) return service;
        final CountDownLatch latch = new CountDownLatch(1);
        ServiceConnection conn = new ServiceConnection() {
            @Override
            public void onServiceConnected(ComponentName name, IBinder binder) {
                service = IInAppBillingService.Stub.asInterface(binder);
                latch.countDown();
            }

            @Override
            public void onServiceDisconnected(ComponentName name) {
                service = null;
            }
        };
        Intent intent = new Intent(BuildConfig.STORE_BILLING_ACTION);
        intent.setPackage(BuildConfig.STORE_PACKAGE);
        boolean bound;
        try {
            bound = getContext().bindService(intent, conn, Context.BIND_AUTO_CREATE);
        } catch (SecurityException e) {
            bound = false;
        }
        if (!bound) {
            try {
                getContext().unbindService(conn);
            } catch (Exception ignored) {
            }
            return null;
        }
        connection = conn;
        try {
            latch.await(8, TimeUnit.SECONDS);
        } catch (InterruptedException ignored) {
        }
        return service;
    }

    private void rejectNoStore(PluginCall call) {
        call.reject("برای خرید سکه، " + BuildConfig.STORE_NAME + " باید روی گوشی نصب باشد.", "NO_STORE");
    }

    // ---------- متدهای قابل صدا زدن از بازی ----------

    /** آیا خرید ممکن است؟ */
    @PluginMethod
    public void init(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("store", BuildConfig.STORE_ID);
        ret.put("storeName", BuildConfig.STORE_NAME);
        if (BuildConfig.STORE_RSA_KEY.isEmpty()) {
            ret.put("ready", false);
            ret.put("reason", "کلید عمومی " + BuildConfig.STORE_NAME + " در ساخت اپ تنظیم نشده.");
            call.resolve(ret);
            return;
        }
        IInAppBillingService s = connect();
        if (s == null) {
            ret.put("ready", false);
            ret.put("reason", "برای خرید سکه، " + BuildConfig.STORE_NAME + " باید روی گوشی نصب باشد.");
            call.resolve(ret);
            return;
        }
        try {
            int code = s.isBillingSupported(API, getContext().getPackageName(), INAPP);
            ret.put("ready", code == OK);
            if (code != OK) ret.put("reason", "پرداخت درون‌برنامه‌ای در دسترس نیست (کد " + code + "). شاید وارد حساب " + BuildConfig.STORE_NAME + " نشده‌ای.");
        } catch (RemoteException e) {
            ret.put("ready", false);
            ret.put("reason", "اتصال به " + BuildConfig.STORE_NAME + " برقرار نشد.");
        }
        call.resolve(ret);
    }

    /** قیمت بسته‌ها از خود فروشگاه: { products: [{ id, price, title }] } */
    @PluginMethod
    public void products(PluginCall call) {
        IInAppBillingService s = connect();
        if (s == null) {
            rejectNoStore(call);
            return;
        }
        try {
            ArrayList<String> ids = new ArrayList<>();
            JSArray arr = call.getArray("ids", new JSArray());
            for (int i = 0; i < arr.length(); i++) ids.add(arr.getString(i));
            Bundle query = new Bundle();
            query.putStringArrayList("ITEM_ID_LIST", ids);
            Bundle res = s.getSkuDetails(API, getContext().getPackageName(), INAPP, query);
            int code = res.getInt("RESPONSE_CODE", -1);
            if (code != OK) {
                call.reject("قیمت‌ها گرفته نشد (کد " + code + ")", String.valueOf(code));
                return;
            }
            JSArray out = new JSArray();
            List<String> list = res.getStringArrayList("DETAILS_LIST");
            if (list != null) {
                for (String json : list) {
                    JSONObject o = new JSONObject(json);
                    JSObject p = new JSObject();
                    p.put("id", o.optString("productId"));
                    p.put("price", o.optString("price"));
                    p.put("title", o.optString("title"));
                    out.put(p);
                }
            }
            JSObject ret = new JSObject();
            ret.put("products", out);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("قیمت‌ها گرفته نشد", e);
        }
    }

    /** خرید یک بسته. نتیجه: { id, token, orderId } (هنوز مصرف نشده؛ بعد از دادن سکه consume را صدا بزنید) */
    @PluginMethod
    public void buy(PluginCall call) {
        String id = call.getString("id");
        if (id == null) {
            call.reject("شناسه‌ی بسته مشخص نیست");
            return;
        }
        if (buyCall != null) {
            call.reject("یک خرید دیگر در جریان است", "BUSY");
            return;
        }
        IInAppBillingService s = connect();
        if (s == null) {
            rejectNoStore(call);
            return;
        }
        try {
            String payload = UUID.randomUUID().toString();
            Bundle res = s.getBuyIntent(API, getContext().getPackageName(), id, INAPP, payload);
            int code = res.getInt("RESPONSE_CODE", -1);
            if (code == ITEM_ALREADY_OWNED) {
                // خرید قبلی هنوز مصرف نشده؛ بازی باید با pending آن را تحویل بگیرد
                call.reject("خرید قبلی هنوز تحویل نشده", "ALREADY_OWNED");
                return;
            }
            PendingIntent pi = res.getParcelable("BUY_INTENT");
            if (code != OK || pi == null) {
                call.reject("خرید شروع نشد (کد " + code + ")", String.valueOf(code));
                return;
            }
            buyCall = call;
            buyPayload = payload;
            bridge.saveCall(call);
            final IntentSenderRequest req = new IntentSenderRequest.Builder(pi.getIntentSender()).build();
            getActivity().runOnUiThread(() -> buyLauncher.launch(req));
        } catch (Exception e) {
            buyCall = null;
            call.reject("خرید شروع نشد", e);
        }
    }

    private void onBuyResult(ActivityResult result) {
        PluginCall call = buyCall;
        String payload = buyPayload;
        buyCall = null;
        buyPayload = null;
        if (call == null) return;
        bridge.releaseCall(call);
        Intent data = result.getData();
        int code = data == null ? USER_CANCELED : data.getIntExtra("RESPONSE_CODE", OK);
        if (result.getResultCode() != Activity.RESULT_OK || code != OK || data == null) {
            if (code == USER_CANCELED || result.getResultCode() == Activity.RESULT_CANCELED) {
                call.reject("خرید لغو شد", "CANCELED");
            } else {
                call.reject("خرید انجام نشد (کد " + code + ")", String.valueOf(code));
            }
            return;
        }
        String json = data.getStringExtra("INAPP_PURCHASE_DATA");
        String sig = data.getStringExtra("INAPP_DATA_SIGNATURE");
        JSObject p = verify(json, sig);
        if (p == null) {
            call.reject("امضای خرید معتبر نبود", "BAD_SIGNATURE");
            return;
        }
        if (payload != null && !payload.equals(p.getString("payload"))) {
            call.reject("اطلاعات خرید با درخواست جور نبود", "BAD_PAYLOAD");
            return;
        }
        call.resolve(p);
    }

    /** مصرف خرید تا بسته دوباره قابل خرید باشد. فقط بعد از ذخیره‌ی سکه صدا زده شود. */
    @PluginMethod
    public void consume(PluginCall call) {
        String token = call.getString("token");
        IInAppBillingService s = connect();
        if (s == null) {
            rejectNoStore(call);
            return;
        }
        try {
            int code = s.consumePurchase(API, getContext().getPackageName(), token);
            if (code == OK) call.resolve();
            else call.reject("مصرف خرید انجام نشد (کد " + code + ")", String.valueOf(code));
        } catch (RemoteException e) {
            call.reject("مصرف خرید انجام نشد", e);
        }
    }

    /** خریدهای تأییدشده‌ای که هنوز مصرف نشده‌اند: { purchases: [{ id, token, orderId }] } */
    @PluginMethod
    public void pending(PluginCall call) {
        IInAppBillingService s = connect();
        if (s == null) {
            rejectNoStore(call);
            return;
        }
        try {
            JSArray out = new JSArray();
            String cont = null;
            do {
                Bundle res = s.getPurchases(API, getContext().getPackageName(), INAPP, cont);
                int code = res.getInt("RESPONSE_CODE", -1);
                if (code != OK) {
                    call.reject("خریدهای قبلی خوانده نشد (کد " + code + ")", String.valueOf(code));
                    return;
                }
                List<String> data = res.getStringArrayList("INAPP_PURCHASE_DATA_LIST");
                List<String> sigs = res.getStringArrayList("INAPP_DATA_SIGNATURE_LIST");
                if (data != null && sigs != null) {
                    for (int i = 0; i < data.size() && i < sigs.size(); i++) {
                        JSObject p = verify(data.get(i), sigs.get(i));
                        if (p != null) out.put(p);
                    }
                }
                cont = res.getString("INAPP_CONTINUATION_TOKEN");
            } while (cont != null && !cont.isEmpty());
            JSObject ret = new JSObject();
            ret.put("purchases", out);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("خریدهای قبلی خوانده نشد", e);
        }
    }

    // ---------- بررسی امضا ----------

    /** امضای فروشگاه را با کلید عمومی بررسی می‌کند؛ اگر درست نبود null برمی‌گرداند. */
    private JSObject verify(String json, String signature) {
        if (json == null || signature == null || BuildConfig.STORE_RSA_KEY.isEmpty()) return null;
        try {
            byte[] keyBytes = Base64.decode(BuildConfig.STORE_RSA_KEY, Base64.DEFAULT);
            PublicKey key = KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(keyBytes));
            Signature sig = Signature.getInstance("SHA1withRSA");
            sig.initVerify(key);
            sig.update(json.getBytes("UTF-8"));
            if (!sig.verify(Base64.decode(signature, Base64.DEFAULT))) return null;
            JSONObject o = new JSONObject(json);
            if (!getContext().getPackageName().equals(o.optString("packageName", getContext().getPackageName()))) return null;
            if (o.optInt("purchaseState", 0) != 0) return null; // ۰ یعنی پرداخت‌شده
            JSObject p = new JSObject();
            p.put("id", o.optString("productId"));
            p.put("token", o.optString("purchaseToken", o.optString("token")));
            p.put("orderId", o.optString("orderId"));
            p.put("payload", o.optString("developerPayload"));
            return p;
        } catch (IllegalArgumentException | JSONException e) {
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}
