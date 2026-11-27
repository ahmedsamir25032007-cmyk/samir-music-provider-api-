import { deduplicate } from "./deduplicate.mjs";

const sample = [
  {
    title: "Believer",
    artist: "Imagine Dragons",
    source: "iTunes",
    preview: "https://example.com/preview.mp3"
  },
  {
    title: "believer",
    artist: "Imagine Dragons",
    source: "Jamendo",
    audio: "https://example.com/song.mp3"
  },
  {
    title: "BBC World Service",
    artist: "United Kingdom",
    type: "radio",
    source: "Radio Browser"
  }
];

const result = deduplicate(sample);

console.log("Input results:", sample.length);
console.log("Unique results:", result.length);
console.log(JSON.stringify(result, null, 2));
