export async function enablePush(vapidPublicKey) {
  if (!("serviceWorker" in navigator)) return null;

  const reg = await navigator.serviceWorker.register("/sw.js");
  const permission = await Notification.requestPermission();

  if (permission !== "granted") return null;

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidPublicKey,
  });

  return sub;
}
