package fr.journalmigraines.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import androidx.core.content.pm.ShortcutInfoCompat;
import androidx.core.content.pm.ShortcutManagerCompat;
import androidx.core.graphics.drawable.IconCompat;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;

/**
 * Protège les liens journalmigraines://… (widget et raccourcis de l'icône).
 *
 * Ces liens notent une journée ou une crise d'un toucher. Sans protection, n'importe quelle appli installée
 * pourrait en envoyer un et ajouter de fausses entrées au journal. L'appli génère donc, au premier lancement,
 * une clé aléatoire gardée dans son espace privé ; le widget et les raccourcis la joignent à leurs liens,
 * et tout lien arrivé sans la bonne clé est vidé avant que la page ne le voie.
 */
final class LinkGuard {
    private static final String EXTRA = "fr.journalmigraines.app.LINK_KEY";
    private static final String PREFS = "liens";
    private static final String PREF_KEY = "cle";
    private static final String SCHEME = "journalmigraines";

    private LinkGuard() {}

    /** Clé de l'appli, créée au premier appel (32 octets aléatoires, en hexadécimal). */
    private static synchronized String key(Context ctx) {
        SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String k = p.getString(PREF_KEY, null);
        if (k == null) {
            byte[] b = new byte[32];
            new SecureRandom().nextBytes(b);
            StringBuilder s = new StringBuilder(64);
            for (byte x : b) s.append(String.format("%02x", x));
            k = s.toString();
            p.edit().putString(PREF_KEY, k).apply();
        }
        return k;
    }

    /** Lien interne vers l'appli, avec la clé : utilisé par le widget et les raccourcis. */
    static Intent link(Context ctx, String uri) {
        Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(uri), ctx, MainActivity.class);
        i.putExtra(EXTRA, key(ctx));
        return i;
    }

    /** Vide le lien d'un message qui n'a pas la bonne clé : il n'atteindra jamais la page. */
    static void check(Context ctx, Intent i) {
        if (i == null || i.getData() == null || !SCHEME.equals(i.getData().getScheme())) return;
        String got;
        try {
            got = i.getStringExtra(EXTRA);
        } catch (RuntimeException e) {
            got = null; // message mal formé : refusé
        }
        boolean ok = got != null
            && MessageDigest.isEqual(got.getBytes(StandardCharsets.UTF_8), key(ctx).getBytes(StandardCharsets.UTF_8));
        if (!ok) i.setData(null);
    }

    /** Raccourcis de l'icône (appui long), créés au lancement pour porter la clé. */
    static void publishShortcuts(Context ctx) {
        try {
            ShortcutManagerCompat.setDynamicShortcuts(ctx, Arrays.asList(
                shortcut(ctx, "lien_crise_forte", R.string.sc_strong_short, R.string.sc_strong_long, R.drawable.ic_sc_storm, "journalmigraines://quick?l=9"),
                shortcut(ctx, "lien_medicament", R.string.sc_med_short, R.string.sc_med_long, R.drawable.ic_sc_med, "journalmigraines://med"),
                shortcut(ctx, "lien_ma_journee", R.string.sc_day_short, R.string.sc_day_long, R.drawable.ic_sc_edit, "journalmigraines://day")
            ));
        } catch (RuntimeException e) {
            // Lanceur sans raccourcis ou quota atteint : l'appli marche sans.
        }
    }

    private static ShortcutInfoCompat shortcut(Context ctx, String id, int shortLabel, int longLabel, int icon, String uri) {
        return new ShortcutInfoCompat.Builder(ctx, id)
            .setShortLabel(ctx.getString(shortLabel))
            .setLongLabel(ctx.getString(longLabel))
            .setIcon(IconCompat.createWithResource(ctx, icon))
            .setIntent(link(ctx, uri))
            .build();
    }
}
