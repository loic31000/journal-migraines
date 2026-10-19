package fr.journalmigraines.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.widget.RemoteViews;

/**
 * Widget de l'écran d'accueil : noter sa journée ou une crise en un toucher.
 * Chaque bouton ouvre l'appli avec un lien journalmigraines://… que la page traite (handleLink).
 * Le widget ne lit aucune note : il n'affiche que des boutons, rien de personnel.
 */
public class JournalWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) {
            RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.widget_journal);
            v.setOnClickPendingIntent(R.id.w_title, link(ctx, "journalmigraines://day", 10));
            v.setOnClickPendingIntent(R.id.w_nopain, link(ctx, "journalmigraines://nopain", 11));
            v.setOnClickPendingIntent(R.id.w_light, link(ctx, "journalmigraines://quick?l=3", 12));
            v.setOnClickPendingIntent(R.id.w_mid, link(ctx, "journalmigraines://quick?l=6", 13));
            v.setOnClickPendingIntent(R.id.w_strong, link(ctx, "journalmigraines://quick?l=9", 14));
            mgr.updateAppWidget(id, v);
        }
    }

    private static PendingIntent link(Context ctx, String uri, int code) {
        Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(uri), ctx, MainActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(ctx, code, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
