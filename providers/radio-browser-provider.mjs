const RadioBrowserProvider = {
  id: "radio-browser",
  name: "Radio Browser",
  status: "active",

  async search(query) {
    const cleanQuery = query.trim();

    if (!cleanQuery) return [];

    const params = new URLSearchParams({
      name: cleanQuery,
      limit: "10",
      hidebroken: "true",
      order: "clickcount",
      reverse: "true"
    });

    const response = await fetch(
      `https://de1.api.radio-browser.info/json/stations/search?${params}`,
      {
        headers: {
          "User-Agent": "SamirMusicProviderAPI/1.0"
        },
        signal: AbortSignal.timeout(8000)
      }
    );

    if (!response.ok) {
      throw new Error("Radio Browser API request failed");
    }

    const stations = await response.json();

    return stations.map(station => ({
      title: station.name,
      artist: station.country || "Internet Radio",
      audio: station.url_resolved,
      link: station.homepage,
      image: station.favicon,
      country: station.country,
      language: station.language,
      codec: station.codec,
      bitrate: station.bitrate,
      tags: station.tags,
      source: "Radio Browser",
      type: "radio"
    }));
  }
};

export default RadioBrowserProvider;
