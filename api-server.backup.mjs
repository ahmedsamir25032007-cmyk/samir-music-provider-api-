import http from "node:http";
import {
  getProviders,
  getProvider,
  loadProviders
} from "./provider-registry.mjs";

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

      const provider = getProvider(providerId);

      if (!provider) {
        res.writeHead(404);
        res.end(JSON.stringify({
          success: false,
          error: "Provider not found"
        }));
        return;
      }

      const results = await provider.search(query);
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
