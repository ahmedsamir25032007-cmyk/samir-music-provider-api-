# Samir Music Provider API

<p align="center">
  <strong>A modular, multi-provider music search API built with Node.js.</strong><br/>
  Search independent music and radio sources through one HTTP interface.
</p>

<p align="center">
  <img alt="Node.js 18+" src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white"/>
  <img alt="JavaScript ES Modules" src="https://img.shields.io/badge/JavaScript-ESM-F7DF1E?logo=javascript&logoColor=black"/>
  <img alt="Development status" src="https://img.shields.io/badge/status-in%20development-orange"/>
</p>

---

## Overview

**Samir Music Provider API** combines multiple music and radio sources behind a simple API. Providers are loaded dynamically from the `providers/` directory, so new sources can be added as independent modules.

This project is under active development. Availability depends on each upstream service, network conditions, and any credentials that service requires.

## Features

- Dynamic provider registry and automatic module loading
- Search one provider or all registered providers
- Duplicate-result removal and metadata merging
- Music and internet-radio filtering
- Smart sorting that prioritizes audio and preview URLs
- Provider failure isolation during all-provider searches
- Configurable result limits

## Providers

| Provider ID | Source | Returned data | Important notes |
|---|---|---|---|
| `itunes` | Apple iTunes Search API | Track metadata, artwork, store link, preview URL | Preview clips only; not full-track streaming |
| `jamendo` | Jamendo | Independent music metadata and audio URL | Requires valid `JAMENDO_CLIENT_ID`; follow each track's licence |
| `radio-browser` | Radio Browser | Internet radio stations and stream URLs | Live radio, not an on-demand song catalogue |
| `demo` | Built-in demo | Sample result | For development and testing |

A provider may be listed even when its upstream service or credentials are currently unavailable.

## Requirements

- Node.js 18 or newer
- Git
- Internet connection
- A valid Jamendo Client ID only if using Jamendo

## Quick Start

```bash
git clone https://github.com/ahmedsamir25032007-cmyk/samir-music-provider-api-.git
cd samir-music-provider-api-
node api-server.mjs
```

The server listens on port **3000**.

The documented server uses Node.js built-in modules and native `fetch`; no separate dependency installation is needed to run it.

### Optional: Configure Jamendo

Set your Client ID before starting the server:

```bash
export JAMENDO_CLIENT_ID="YOUR_CLIENT_ID"
node api-server.mjs
```

Obtain the Client ID from the Jamendo developer portal. Never commit credentials or share them in screenshots or public issues. The current provider reads only the Client ID; do not add a Client Secret.

## API Reference

Local base URL:

```text
http://127.0.0.1:3000
```

| Endpoint | Description |
|---|---|
| `GET /health` | Check whether the server is running |
| `GET /providers` | List loaded providers |
| `GET /music?q=Believer` | Search with the default provider (`itunes`) |
| `GET /music?q=Believer&provider=itunes` | Search one provider |
| `GET /music?q=love&provider=all` | Search all providers |
| `GET /music?q=BBC&provider=all&type=radio` | Return radio results |
| `GET /music?q=Believer&provider=all&type=music` | Return music results |
| `GET /music?q=Believer&provider=itunes&limit=3` | Limit the result count |

### Query parameters

| Parameter | Required | Default | Description |
|---|---:|---|---|
| `q` | Yes | — | Search query |
| `provider` | No | `itunes` | Provider ID or `all` |
| `type` | No | `all` | `all`, `music`, or `radio` |
| `limit` | No | `5` | Result limit, clamped to 1–20 |

### Try it with curl

```bash
curl "http://127.0.0.1:3000/health"
curl "http://127.0.0.1:3000/providers"
curl -G "http://127.0.0.1:3000/music" --data-urlencode "q=Mon Majhi Re" --data-urlencode "provider=itunes"
curl -G "http://127.0.0.1:3000/music" --data-urlencode "q=love" --data-urlencode "provider=all" --data-urlencode "type=music"
```

### Example response

```json
{
  "success": true,
  "provider": "itunes",
  "type": "all",
  "count": 1,
  "results": [
    {
      "title": "Example Track",
      "artist": "Example Artist",
      "album": "Example Album",
      "image": "https://example.com/artwork.jpg",
      "preview": "https://example.com/preview.m4a",
      "link": "https://example.com/track"
    }
  ]
}
```

Actual result fields depend on the provider. A preview URL is not a full-song URL.

## Project Structure

```text
.
├── api-server.mjs
├── provider-registry.mjs
├── providers/
│   ├── demo-provider.mjs
│   ├── itunes-provider.mjs
│   ├── jamendo-provider.mjs
│   └── radio-browser-provider.mjs
└── utils/
    └── deduplicate.mjs
```

## Add a Provider

Create a separate `.mjs` file inside `providers/`. Each module must export a default object with `id`, `name`, `status`, and an asynchronous `search(query)` method.

```javascript
const ExampleProvider = {
  id: "example",
  name: "Example Provider",
  status: "active",

  async search(query) {
    if (!query.trim()) return [];
    // Fetch and map upstream results here.
    return [];
  }
};

export default ExampleProvider;
```

Use these common result fields when available: `title`, `artist`, `album`, `image`, `audio`, `preview`, `link`, `duration`, `license`, and `type`. Set `type: "radio"` for radio stations. Never invent audio URLs or describe a preview as a full track.

## Contributing

Contributions are welcome! Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Use the repository's Bug Report or Feature Request issue templates when reporting problems or suggesting improvements.

## Security

Do not post API keys, passwords, tokens, or exploit details in public issues. Report suspected vulnerabilities privately to the repository owner through GitHub. Do not follow unverified external links asking you to sign in, install software, or disclose credentials.

## Important Notes

- This is an independent project and is not affiliated with Apple, Jamendo, Radio Browser, or other music services.
- Each upstream provider has its own terms, availability, and content licences. Follow them.
- The API does not guarantee access to every song or full-length playback.
- Do not expose this development server publicly without appropriate production security controls, authentication where needed, and rate limiting.

## Author

**Samir** · [GitHub](https://github.com/ahmedsamir25032007-cmyk)

If you find the project useful, consider starring the repository or contributing improvements.
