import { Hono } from "hono";
import { ConfigService } from "@/config/config-service";

const app = new Hono();

// iOS Universal Links — Apple App Site Association
app.get("/apple-app-site-association", (c) => {
  const teamId = ConfigService.getInstance().getAppleTeamId();
  const bundleId = ConfigService.getInstance().getAppBundleId();

  if (!teamId || !bundleId) {
    console.warn(
      "APPLE_TEAM_ID or APP_BUNDLE_ID not set in environment variables. Apple Universal Links will not work.",
    );
  }
  return c.json({
    applinks: {
      apps: [],
      details: [
        {
          appIDs: [`${teamId}.${bundleId}`],
          components: [
            { "/": "/invitation*" },
            { "/": "/verify-email*" },
            { "/": "/reset-password*" },
          ],
        },
      ],
    },
  });
});

// Android App Links — Digital Asset Links
app.get("/assetlinks.json", (c) => {
  return c.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: ConfigService.getInstance().getAppBundleId(),
        sha256_cert_fingerprints: [
          // TODO: Replace with your signing certificate fingerprint
          // Get it with: keytool -list -v -keystore your-keystore.jks | grep SHA256
          // Or for debug: keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android
          "TODO:ADD_YOUR_SHA256_FINGERPRINT",
        ],
      },
    },
  ]);
});

export default app;
