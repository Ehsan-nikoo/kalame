package com.kalameh.game;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.util.Calendar;
import java.util.Locale;

/**
 * ویجت «کلمه‌ی امروز».
 * بازی کلمه‌ی روزِ هفت روز آینده و وضعیت مرحله‌ی روزانه را (از CoinStorePlugin.widget) اینجا می‌گذارد؛
 * ویجت هر ساعت کلمه‌ی همان روز را نشان می‌دهد، حتی اگر بازی چند روز باز نشده باشد.
 */
public class KalamehWidget extends AppWidgetProvider {
    static final String PREFS = "kalameh_widget";
    static final String KEY_DATA = "data";

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) manager.updateAppWidget(id, build(context));
    }

    /** بعد از رسیدن داده‌ی تازه از بازی */
    static void refresh(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, KalamehWidget.class));
        if (ids == null || ids.length == 0) return;
        RemoteViews views = build(context);
        for (int id : ids) manager.updateAppWidget(id, views);
    }

    static void save(Context context, String json) {
        prefs(context).edit().putString(KEY_DATA, json).apply();
        refresh(context);
    }

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private static String dayKey(Calendar c) {
        return String.format(Locale.US, "%04d-%02d-%02d", c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH));
    }

    private static String faDigits(String s) {
        StringBuilder b = new StringBuilder();
        for (char ch : s.toCharArray()) b.append(ch >= '0' && ch <= '9' ? (char) ('۰' + (ch - '0')) : ch);
        return b.toString();
    }

    private static RemoteViews build(Context context) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_word);

        Intent open = new Intent(context, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(context, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pi);

        String raw = prefs(context).getString(KEY_DATA, null);
        if (raw == null) return views;
        try {
            JSONObject data = new JSONObject(raw);
            Calendar now = Calendar.getInstance();
            String today = dayKey(now);
            Calendar y = Calendar.getInstance();
            y.add(Calendar.DAY_OF_MONTH, -1);
            String yesterday = dayKey(y);

            JSONObject days = data.optJSONObject("days");
            JSONObject word = days != null ? days.optJSONObject(today) : null;
            if (word != null) {
                views.setTextViewText(R.id.widget_title, context.getString(R.string.widget_title));
                views.setTextViewText(R.id.widget_word, word.optString("w"));
                views.setTextViewText(R.id.widget_meaning, word.optString("m"));
            } else {
                // داده‌ی این روز تمام شده (بازی بیش از یک هفته باز نشده)
                views.setTextViewText(R.id.widget_word, context.getString(R.string.app_name));
                views.setTextViewText(R.id.widget_meaning, "یه کلمه‌ی تازه منتظرته؛ بیا بازی 🙂");
            }

            String last = data.optString("last", "");
            int run = data.optInt("run", 0);
            String chip;
            if (today.equals(last)) {
                chip = run > 1 ? "🔥 " + faDigits(String.valueOf(run)) + " روز پشت‌سرهم · امروز حل شد ✓" : "مرحله‌ی امروز حل شد ✓";
            } else if (yesterday.equals(last) && run > 0) {
                chip = "🔥 " + faDigits(String.valueOf(run)) + " روز · امروز رو از دست نده!";
            } else {
                chip = "مرحله‌ی روزانه منتظرته 📅";
            }
            views.setTextViewText(R.id.widget_streak, chip);
            views.setViewVisibility(R.id.widget_streak, View.VISIBLE);
        } catch (Exception e) {
            // داده‌ی خراب: همان متن پیش‌فرض
        }
        return views;
    }
}
