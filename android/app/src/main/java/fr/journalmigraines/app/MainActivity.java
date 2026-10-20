package fr.journalmigraines.app;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Avant Capacitor : un lien journalmigraines:// sans la clé de l'appli est vidé (voir LinkGuard)
        LinkGuard.check(this, getIntent());
        super.onCreate(savedInstanceState);
        LinkGuard.publishShortcuts(this);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        LinkGuard.check(this, intent);
        super.onNewIntent(intent);
    }
}
