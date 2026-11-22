package com.kalameh.game;

import android.graphics.Color;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// رنگ پشت نوارهای سیستم (پایین و بالای صفحه). روی WebViewهای قدیمی‌تر Capacitor صفحه را
// بالای نوار پایین گوشی می‌نشاند و این رنگ زیر آن دیده می‌شود؛ بازی آن را هم‌رنگ صفحه‌ی خودش می‌کند.
@CapacitorPlugin(name = "Backdrop")
public class BackdropPlugin extends Plugin {
    @PluginMethod
    public void set(PluginCall call) {
        String color = call.getString("color", "");
        getActivity().runOnUiThread(() -> {
            try {
                getActivity().getWindow().getDecorView().setBackgroundColor(Color.parseColor(color));
            } catch (IllegalArgumentException e) {
                // رنگ نامعتبر: همان رنگ قبلی می‌ماند
            }
            call.resolve();
        });
    }
}
