
import http from "node:http";
import {
  getProviders,
  getProvider,
  loadProviders
} from "./provider-registry.mjs";

// Provider search timeout: 8 seconds
async function searchWithTimeout(provider, query, timeoutMs = 8000) {
  let timeout;

  try {
    return await Promise.race([
      provider.search(query),

      new Promise((_, reject) => {
        timeout = setTimeout(() => {
          reject(new Error("Provider request timed out"));
        }, timeoutMs);
      })
    ]);
  } finally {
    clearTimeout(timeout);
  }
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

    } else if (url.pathname === "/providers") {
      res.end(JSON.stringify({
        success: true,
        count: getProviders().length,
        providers: getProviders()
      }));

    } else if (url.pathname === "/music") {
      const query = url.searchParams.get("q") || "";
      const providerId = url.searchParams.get("provider") || "itunes";

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

      // Search all providers
      if (providerId === "all") {
        const providers = getProviders();

        const results = await Promise.allSettled(
          providers.map(async (item) => {
            const provider = getProvider(item.id);
            const songs = await searchWithTimeout(provider, query);

            return {
              provider: item.id,
              results: songs.slice(0, limit)
            };
          })
        );

        const successful = [];
        const failed = [];

        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            successful.push(result.value);
          } else {
            failed.push({
              provider: providers[index].id,
              error: result.reason.message
            });
          }
        });

        const allResults = successful.flatMap(
          item => item.results.map(song => ({
            ...song,
            provider: item.provider
          }))
        );

        res.end(JSON.stringify({
          success: successful.length > 0,
          query,
          mode: "all",
          providers: successful.map(item => item.provider),
          failed,
          count: allResults.length,
          results: allResults
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

      const results = await searchWithTimeout(provider, query);
      const limitedResults = results.slice(0, limit);

      res.end(JSON.stringify({
        success: true,
        provider: provider.id,
        count: limitedResults.length,
        results: limitedResults
      }));

    } else {
      res.writeHead(404);
      res.end(JSON.stringify({
        error: "API route not found"
      }));
    }

  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({
      success: false,
      error: error.message
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
