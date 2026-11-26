const JamendoProvider = {
  id: "jamendo",
  name: "Jamendo",
  status: "active",

  async search(query) {
    const clientId = process.env.JAMENDO_CLIENT_ID;

    if (!clientId) {
      throw new Error("Jamendo Client ID is not configured");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      format: "json",
      search: query.trim(),
      limit: "5"
    });

    const response = await fetch(
      `https://api.jamendo.com/v3.0/tracks/?${params}`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (!response.ok) {
      throw new Error("Jamendo API request failed");
    }

    const data = await response.json();

    if (data.headers?.status !== "success") {
      throw new Error(
        data.headers?.error_message || "Jamendo API error"
      );
    }

    return data.results.map(track => ({
      title: track.name,
      artist: track.artist_name,
      album: track.album_name,
      image: track.album_image,
      audio: track.audio,
      link: track.shareurl,
      duration: track.duration,
      license: track.license_ccurl,
      source: "Jamendo"
    }));
  }
};

export default JamendoProvider;
