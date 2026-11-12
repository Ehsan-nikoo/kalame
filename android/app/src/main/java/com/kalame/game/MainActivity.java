package com.kalame.game;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // پلاگین فروشگاه سکه باید پیش از ساخته شدن پل Capacitor ثبت شود
        registerPlugin(CoinStorePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
