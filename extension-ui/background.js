
const SCAN_PAGE = chrome.runtime.getURL("scan.html");
const redirecting = new Set();

chrome.webNavigation.onBeforeNavigate.addListener(async (event) => {
  if (event.frameId !== 0 || event.tabId < 0) return;

  let url;
  try {
    url = new URL(event.url);
  } catch {
    return;
  }

  if (!["http:", "https:"].includes(url.protocol)) return;
  if (event.url.startsWith(chrome.runtime.getURL(""))) return;
  if (redirecting.has(event.tabId)) return;

  const tabId = event.tabId;
  const allowKey = `allow:${tabId}`;

  const saved = await chrome.storage.session.get(allowKey);

  if (saved[allowKey] === event.url) {
    await chrome.storage.session.remove(allowKey);
    return;
  }

  redirecting.add(tabId);

  try {
    await chrome.storage.session.set({
      [`pending:${tabId}`]: {
        url: event.url,
        timestamp: Date.now()
      }
    });

    await chrome.tabs.update(tabId, {
      url: `${SCAN_PAGE}?tabId=${tabId}`
    });
  } catch (error) {
    console.error("Sentinel navigation error:", error);
  } finally {
    setTimeout(() => redirecting.delete(tabId), 1500);
  }
});

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  (async () => {
    const tabId = message.tabId;

    if (!Number.isInteger(tabId)) {
      respond({ ok: false, error: "Invalid tab." });
      return;
    }

    const pendingKey = `pending:${tabId}`;

    if (message.type === "CONTINUE") {
      const saved = await chrome.storage.session.get(pendingKey);
      const pending = saved[pendingKey];

      if (!pending?.url) {
        respond({ ok: false, error: "No pending destination." });
        return;
      }

      await chrome.storage.session.set({
        [`allow:${tabId}`]: pending.url
      });

      await chrome.storage.session.remove(pendingKey);

      await chrome.tabs.update(tabId, {
        url: pending.url
      });

      respond({ ok: true });
      return;
    }

    if (message.type === "STAY") {
      await chrome.storage.session.remove(pendingKey);
      respond({ ok: true });
      return;
    }

    respond({ ok: false, error: "Unknown request." });
  })().catch(error => {
    respond({ ok: false, error: error.message });
  });

  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  redirecting.delete(tabId);
  chrome.storage.session.remove([
    `pending:${tabId}`,
    `allow:${tabId}`
  ]).catch(() => {});
});
