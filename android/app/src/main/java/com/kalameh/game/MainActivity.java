package com.kalameh.game;

import android.os.Bundle;
import android.os.SystemClock;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final long EXIT_WINDOW_MS = 2000;
    private long lastBackAtHome = 0;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // پلاگین فروشگاه سکه باید پیش از ساخته شدن پل Capacitor ثبت شود
        registerPlugin(CoinStorePlugin.class);
        super.onCreate(savedInstanceState);

        WebView webView = getBridge().getWebView();
        // اندازه‌ی نوشته‌ها را خود بازی (تنظیمات ← اندازه‌ی نوشته) تعیین می‌کند؛
        // بزرگ‌نمایی فونت گوشی صفحه‌ها را از قاب بیرون می‌زد
        webView.getSettings().setTextZoom(100);

        // «برگشت»: از هر جای بازی به منوی اصلی؛ در منوی اصلی با دو بار زدن بیرون می‌رود
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                webView.evaluateJavascript(
                    "window.kalamehBack ? window.kalamehBack() : 'home'",
                    (result) -> {
                        if (result == null || !result.contains("home")) return;
                        long now = SystemClock.uptimeMillis();
                        if (now - lastBackAtHome < EXIT_WINDOW_MS) {
                            finish();
                        } else {
                            lastBackAtHome = now;
                            Toast.makeText(MainActivity.this, "برای خروج دوباره «برگشت» رو بزن", Toast.LENGTH_SHORT).show();
                        }
                    }
                );
            }
        });
    }
}
