// Desktop notifications — Web Notifications API (foreground-only, no server).
// All functions are safe to call anywhere: if unsupported or not permitted,
// they no-op silently so self-hosted / restricted environments never break.

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getPermission(): NotificationPermission {
  if (!notificationsSupported()) return "denied";
  return Notification.permission;
}

// Must be called from a user gesture (e.g. toggling the setting on).
export async function requestPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

// Fires a desktop notification. No-op unless supported and granted.
export function notify(title: string, body: string, tag?: string): void {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  try {
    const n = new Notification(title, { body, icon: "/logo2.png", tag });
    // Auto-close so they don't pile up.
    setTimeout(() => n.close(), 6000);
  } catch {
    // Some browsers throw if constructed without a service worker on mobile — ignore.
  }
}
