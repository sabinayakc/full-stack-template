import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { TURNSTILE_SITE_KEY } from "@/constants/app";

interface TurnstileProps {
  onToken: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  action?: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  /** Controls widget visibility. "always" shows the widget frame, "interaction-only"
   *  only shows if user interaction is needed, "execute" is fully invisible. */
  appearance?: "always" | "interaction-only" | "execute";
}

// ─── Web Implementation ────────────────────────────────────────────────────────

function TurnstileWeb({
  onToken,
  onError,
  onExpire,
  action,
  theme = "auto",
  size = "normal",
  appearance = "always",
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbacksRef = useRef({ onToken, onError, onExpire });
  callbacksRef.current = { onToken, onError, onExpire };

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;

    const renderWidget = () => {
      if (!containerRef.current || widgetIdRef.current != null) return;

      const w = (window as unknown as Record<string, unknown>).turnstile as
        | {
            render: (el: HTMLElement, opts: Record<string, unknown>) => string;
            remove: (id: string) => void;
          }
        | undefined;

      if (!w) return;

      widgetIdRef.current = w.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        action,
        theme,
        size,
        appearance,
        callback: (token: string) => callbacksRef.current.onToken(token),
        "error-callback": () => callbacksRef.current.onError?.(),
        "expired-callback": () => callbacksRef.current.onExpire?.(),
        "refresh-expired": "auto",
      });
    };

    // Load the Turnstile script if not already present
    const existing = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
    if (existing) {
      renderWidget();
    } else {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => renderWidget();
      document.head.appendChild(script);
    }

    return () => {
      if (widgetIdRef.current != null) {
        const w = (window as unknown as Record<string, unknown>).turnstile as
          | { remove: (id: string) => void }
          | undefined;
        if (w) w.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [action, theme, size, appearance]);

  return (
    <View style={s.container}>
      <div ref={containerRef} />
    </View>
  );
}

// ─── Native Implementation (WebView) ───────────────────────────────────────────

// Spoof navigator properties so Turnstile doesn't flag the WebView as automated.
// See: https://github.com/nicklausw/webview-turnstile
const NAVIGATOR_OVERRIDES = `
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
  Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
`;

const SAFARI_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

function TurnstileNative({
  onToken,
  onError,
  onExpire,
  action,
  theme = "auto",
  size = "normal",
  appearance = "always",
}: TurnstileProps) {
  // Lazy import to avoid bundling WebView on web
  const WebView = require("react-native-webview").default;
  const isHidden = appearance === "execute";
  const [height, setHeight] = useState(isHidden ? 0 : 65);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"></script>
  <style>
    * { margin: 0; padding: 0; }
    body { display: flex; justify-content: center; background: transparent; }
  </style>
</head>
<body>
  <div id="turnstile"></div>
  <script>
    function renderTurnstile() {
      turnstile.render('#turnstile', {
        sitekey: '${TURNSTILE_SITE_KEY}',
        action: '${action || ""}',
        theme: '${theme}',
        size: '${size}',
        appearance: '${appearance}',
        'refresh-expired': 'auto',
        callback: function(token) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'token', token: token }));
        },
        'error-callback': function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error' }));
        },
        'expired-callback': function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'expired' }));
        },
      });

      // Report widget height so RN can resize
      setTimeout(function() {
        var el = document.getElementById('turnstile');
        var h = el ? el.offsetHeight : 0;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', height: h }));
      }, 500);
    }

    if (typeof turnstile !== 'undefined') {
      renderTurnstile();
    } else {
      document.querySelector('script[src*="turnstile"]').onload = renderTurnstile;
    }
  </script>
</body>
</html>`;

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        switch (data.type) {
          case "token":
            onToken(data.token);
            break;
          case "error":
            onError?.();
            break;
          case "expired":
            onExpire?.();
            break;
          case "height":
            setHeight(data.height >= 0 ? data.height : 0);
            break;
        }
      } catch {
        // ignore malformed messages
      }
    },
    [onToken, onError, onExpire],
  );

  if (!TURNSTILE_SITE_KEY) return null;

  return (
    <View style={[s.container, { height: height || 1, opacity: height > 0 ? 1 : 0 }]}>
      <WebView
        source={{ html }}
        style={{ height: height || 1, backgroundColor: "transparent" }}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        cacheEnabled
        userAgent={SAFARI_UA}
        injectedJavaScriptBeforeContentLoaded={NAVIGATOR_OVERRIDES}
        originWhitelist={["*"]}
        onMessage={handleMessage}
      />
    </View>
  );
}

// ─── Export ─────────────────────────────────────────────────────────────────────

export function Turnstile(props: TurnstileProps) {
  if (!TURNSTILE_SITE_KEY) return null;
  return Platform.OS === "web" ? <TurnstileWeb {...props} /> : <TurnstileNative {...props} />;
}

const s = StyleSheet.create({
  container: {
    alignItems: "center",
    overflow: "hidden",
  },
});
