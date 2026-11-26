const ITunesProvider = {
  id: "itunes",
  name: "iTunes",
  status: "active",
  name: "iTunes",

  async search(query) {
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      return [];
    }

    const params = new URLSearchParams({
      term: cleanQuery,
      entity: "song",
      limit: "5"
    });

    const url = `https://itunes.apple.com/search?${params}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("iTunes API request failed");
    }

    const data = await response.json();

    return data.results.map(song => ({
      title: song.trackName,
      artist: song.artistName,
      album: song.collectionName,
      image: song.artworkUrl100,
      preview: song.previewUrl,
      link: song.trackViewUrl,
      duration: song.trackTimeMillis
    }));
  }
};

export default ITunesProvider;
