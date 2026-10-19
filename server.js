import express from "express";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE = (process.env.PANEL_API_BASE || "https://dripclientofficial.dev/api/v1").replace(/\/+$/, "");
const API_KEY = process.env.PANEL_API_KEY || "";
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

function upstreamHeaders() {
  // Adjust this header only if the provider's official docs specify another name.
  return { "Accept": "application/json", ...(API_KEY ? { "Authorization": `Bearer ${API_KEY}` } : {}) };
}

app.get("/api/products", async (_req, res) => {
  try {
    const upstream = await fetch(`${API_BASE}/products`, {
      headers: upstreamHeaders(),
      signal: AbortSignal.timeout(15000)
    });
    const raw = await upstream.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = { message: "Provider returned a non-JSON response." }; }
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: "Provider API rejected the request. Check API key/auth header.", providerStatus: upstream.status });
    }
    // Never return request headers or secrets to the browser.
    res.set("Cache-Control", "no-store");
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Could not connect to provider API.", detail: err.name === "TimeoutError" ? "Provider timed out." : "Check deployment network and API URL." });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true, store: "IKY XITER" }));

app.listen(PORT, () => console.log(`IKY XITER running on port ${PORT}`));