const HelloProvider = {
  name: "HelloProvider",

  async search(query) {
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery) {
      return [];
    }

    if (cleanQuery.includes("messi")) {
      return [
        { title: "Messi Football Result" }
      ];
    } else if (cleanQuery.includes("news")) {
      return [
        { title: "Latest News Result" }
      ];
    } else if (cleanQuery.includes("stats")) {
      return [
        { title: "Player Statistics Result" }
      ];
    } else {
      return [
        { title: "No result found" }
      ];
    }
  }
};

export default HelloProvider;
