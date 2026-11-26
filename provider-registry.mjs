import { readdir } from "node:fs/promises";
import { join } from "node:path";

const providers = new Map();

export function registerProvider(provider) {
  if (!provider.id || typeof provider.search !== "function") {
    throw new Error("Invalid provider");
  }

  providers.set(provider.id, provider);
}

export async function loadProviders() {
  const files = await readdir("./providers");

  for (const file of files) {
    if (!file.endsWith(".mjs")) continue;

    const module = await import(
      `./providers/${file}`
    );

    registerProvider(module.default);
  }

  return getProviders();
}

export function getProvider(id) {
  return providers.get(id);
}

export function getProviders() {
  return [...providers.values()].map(provider => ({
    id: provider.id,
    name: provider.name,
    status: provider.status
  }));
}
