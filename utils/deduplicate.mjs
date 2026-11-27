function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function deduplicate(results = []) {
  const unique = new Map();

  for (const item of results) {
    const title = normalize(item.title);
    const artist = normalize(item.artist);

    if (!title) continue;

    const type = item.type === "radio" ? "radio" : "music";
    const key = `${type}:${title}:${artist}`;

    if (!unique.has(key)) {
      unique.set(key, { ...item });
      continue;
    }

    const existing = unique.get(key);

    // Merge missing metadata from duplicate results.
    for (const [field, value] of Object.entries(item)) {
      if (
        (existing[field] === undefined ||
          existing[field] === null ||
          existing[field] === "") &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        existing[field] = value;
      }
    }

    // Keep track of all providers supplying this result.
    const providers = new Set([
      ...(existing.providers || [existing.provider || existing.source].filter(Boolean)),
      item.provider || item.source
    ].filter(Boolean));

    existing.providers = [...providers];
  }

  return [...unique.values()];
}
