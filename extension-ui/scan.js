
const API_URL = "http://127.0.0.1:8000/analyze";

const tabId = Number(new URLSearchParams(location.search).get("tabId"));
const $ = id => document.getElementById(id);

let destination = "";

function show(section) {
  ["loading", "result", "error"].forEach(id => {
    $(id).hidden = id !== section;
  });
}

async function getDestination() {
  if (!Number.isInteger(tabId) || tabId < 0) {
    throw new Error("Invalid browser tab.");
  }

  const key = `pending:${tabId}`;
  const saved = await chrome.storage.session.get(key);
  const url = saved[key]?.url;

  if (!url || !["http:", "https:"].includes(new URL(url).protocol)) {
    throw new Error("No pending website was found.");
  }

  destination = url;
  $("url").textContent = url;
}

async function sendMessage(type) {
  const response = await chrome.runtime.sendMessage({ type, tabId });
  if (!response?.ok) {
    throw new Error(response?.error || "Browser navigation failed.");
  }
}

function addAction(text, type, danger = false) {
  const button = document.createElement("button");
  button.textContent = text;
  button.className = danger ? "" : "primary";

  button.addEventListener("click", async () => {
    try {
      if (type === "CONTINUE" && !confirm(
        "Only continue if you trust this destination. Sentinel AI may have detected a threat. Proceed?"
      )) return;

      await sendMessage(type);
    } catch (error) {
      alert(error.message);
    }
  });

  $("actions").append(button);
}

function render(data) {
  const unsafe = String(data.safety_verdict).toLowerCase() === "unsafe";

  $("symbol").textContent = unsafe ? "!" : "✓";
  $("symbol").classList.toggle("danger", unsafe);
  $("title").textContent = unsafe
    ? "Potential threat detected"
    : "Backend verdict: Safe";

  $("description").textContent = unsafe
    ? "The backend classified this destination as unsafe. The website has not been opened."
    : "The backend returned a safe verdict. This is a prediction, not a guarantee.";

  $("resultUrl").textContent = destination;
  $("categories").replaceChildren();
  $("actions").replaceChildren();

  const categories = [
    ["Hate speech", data.hate_speech, data.hate_conf],
    ["Phishing", data.phishing, data.phishing_conf],
    ["Explicit content", data.explicit, data.explicit_conf],
    ["Gambling", data.gambling, data.gambling_conf]
  ];

  for (const [name, label, confidence] of categories) {
    const item = document.createElement("div");
    item.className = "category";

    const title = document.createElement("strong");
    title.textContent = name;

    const detail = document.createElement("small");
    const n = Number(confidence);
    const score = confidence !== null && confidence !== "" &&
      confidence !== undefined && Number.isFinite(n) && n >= 0 && n <= 1
      ? ` · ${(n * 100).toFixed(1)}% confidence`
      : " · confidence unavailable";

    detail.textContent = `${label ?? "No label returned"}${score}`;
    item.append(title, detail);
    $("categories").append(item);
  }

  if (unsafe) {
    addAction("Stay protected", "STAY");
    addAction("Continue anyway", "CONTINUE", true);
  } else {
    addAction("Continue to website", "CONTINUE");
    addAction("Stay here", "STAY", true);
  }

  show("result");
}

async function analyze() {
  show("loading");

  try {
    if (!destination) await getDestination();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    let response;

    try {
      response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: destination }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Backend HTTP ${response.status}`);
    }

    if (typeof data.safety_verdict !== "string") {
      throw new Error("Missing safety_verdict in backend response.");
    }

    render(data);
  } catch (error) {
    $("errorText").textContent =
      error.name === "AbortError"
        ? "The scan timed out. Check your Flask server and model inference."
        : `${error.message}. Check that Flask is running at ${API_URL}.`;

    show("error");
  }
}

$("retry").addEventListener("click", analyze);

analyze().catch(error => {
  $("errorText").textContent = error.message;
  show("error");
});
