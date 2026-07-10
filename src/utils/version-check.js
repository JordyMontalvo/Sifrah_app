const POLL_MS = 90 * 1000;
const VERSION_URL = "/version.json";

let currentVersion = null;
let checking = false;
let reloading = false;

function isUserEditing() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

async function fetchRemoteVersion() {
  const res = await fetch(`${VERSION_URL}?_=${Date.now()}`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data && data.version ? String(data.version) : null;
}

function softReload() {
  if (reloading) return;
  if (isUserEditing()) return;
  reloading = true;
  window.location.reload();
}

async function checkVersion() {
  if (checking || reloading) return;
  checking = true;
  try {
    const remote = await fetchRemoteVersion();
    if (!remote) return;
    if (currentVersion == null) {
      currentVersion = remote;
      return;
    }
    if (remote !== currentVersion) softReload();
  } catch (_) {
    // red / CDN temporal: ignorar
  } finally {
    checking = false;
  }
}

export function startVersionCheck() {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return;

  checkVersion();
  setInterval(checkVersion, POLL_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkVersion();
  });
  window.addEventListener("focus", checkVersion);
}
