import http from "node:http";
import {
  getProviders,
  getProvider,
  loadProviders
} from "./provider-registry.mjs";

import { deduplicate } from "./utils/deduplicate.mjs";

async function searchWithTimeout(provider, query, timeoutMs = 8000) {
  let timeout;

  try {
    return await Promise.race([
      provider.search(query),
      new Promise((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Provider request timed out")),
          timeoutMs
        );
      })
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

function resultScore(item) {
  let score = 0;

  if (item.audio) score += 4;
  if (item.preview) score += 3;
  if (item.title) score += 2;
  if (item.artist) score += 2;
  if (item.image) score += 1;
  if (item.album) score += 1;

  return score;
}

function smartSort(results) {
  return results.sort(
    (a, b) => resultScore(b) - resultScore(a)
  );
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    if (url.pathname === "/health") {
      res.end(JSON.stringify({
        success: true,
        status: "Server is running"
      }));
      return;
    }

    if (url.pathname === "/providers") {
      res.end(JSON.stringify({
        success: true,
        count: getProviders().length,
        providers: getProviders()
      }));
      return;
    }

    if (url.pathname !== "/music") {
      res.writeHead(404);
      res.end(JSON.stringify({
        success: false,
        error: "API route not found"
      }));
      return;
    }

    const query = url.searchParams.get("q") || "";
    const providerId = url.searchParams.get("provider") || "itunes";
    const type = url.searchParams.get("type") || "all";

    const limit = Math.min(
      Math.max(Number(url.searchParams.get("limit")) || 5, 1),
      20
    );

    if (!query.trim()) {
      res.writeHead(400);
      res.end(JSON.stringify({
        success: false,
        error: "Search query is required"
      }));
      return;
    }

    if (!["all", "music", "radio"].includes(type)) {
      res.writeHead(400);
      res.end(JSON.stringify({
        success: false,
        error: "Invalid type. Use music, radio or all"
      }));
      return;
    }

    // Search all providers
    if (providerId === "all") {
      const providers = getProviders();

      const results = await Promise.allSettled(
        providers.map(async item => {
          const provider = getProvider(item.id);
          const songs = await searchWithTimeout(provider, query);

          return songs.slice(0, limit).map(song => ({
            ...song,
            provider: item.id,
            providers: [item.id],
            type: song.type || (
              item.id === "radio-browser" ? "radio" : "music"
            )
          }));
        })
      );

      const successful = [];
      const failed = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successful.push(providers[index].id);
        } else {
          failed.push({
            provider: providers[index].id,
            error: result.reason?.message || "Unknown provider error"
          });
        }
      });

      const combined = results
        .filter(result => result.status === "fulfilled")
        .flatMap(result => result.value);

      const uniqueResults = deduplicate(combined);

      const filteredResults = uniqueResults.filter(item =>
        type === "all" || item.type === type
      );

      const finalResults = smartSort(filteredResults);

      res.end(JSON.stringify({
        success: successful.length > 0,
        query,
        mode: "all",
        type,
        providers: successful,
        failed,
        count: finalResults.length,
        results: finalResults
      }));

      return;
    }

    // Search one provider
    const provider = getProvider(providerId);

    if (!provider) {
      res.writeHead(404);
      res.end(JSON.stringify({
        success: false,
        error: "Provider not found"
      }));
      return;
    }

    const songs = await searchWithTimeout(provider, query);

    const results = songs.map(song => ({
      ...song,
      provider: provider.id,
      providers: [provider.id],
      type: song.type || (
        provider.id === "radio-browser" ? "radio" : "music"
      )
    }));

    const filteredResults = results.filter(item =>
      type === "all" || item.type === type
    );

    const finalResults = smartSort(filteredResults).slice(0, limit);

    res.end(JSON.stringify({
      success: true,
      provider: provider.id,
      type,
      count: finalResults.length,
      results: finalResults
    }));

  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({
      success: false,
      error: error.message || "Internal server error"
    }));
  }
});

async function startServer() {
  await loadProviders();

  server.listen(3000, "0.0.0.0", () => {
    console.log("Samir Music API is running on port 3000");
    console.log("Loaded Providers:", getProviders());
  });
}

startServer().catch(error => {
  console.error("Server startup failed:", error.message);
});
