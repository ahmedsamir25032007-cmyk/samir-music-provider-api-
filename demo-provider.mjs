const DemoProvider = {
  id: "demo",
  name: "Demo Music",
  status: "active",

  async search(query) {
    if (!query.trim()) return [];

    return [
      {
        title: query,
        artist: "Demo Artist",
        album: "Demo Album",
        source: "Demo Provider"
      }
    ];
  }
};

export default DemoProvider;
