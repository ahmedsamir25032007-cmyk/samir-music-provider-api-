const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

const BASE_URL = 'https://new17.hdhub4u.cl';
const SEARCH_API = 'https://search.pingora.fyi/collections/post/documents/search';

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36'
};

function parseMovieList($) {
  const movies = [];

  $('ul.recent-movies li.thumb').each((i, el) => {
    const anchor = $(el).find('figure a').first();
    const title =
      anchor.attr('aria-label') ||
      $(el).find('figcaption a').text().trim() ||
      anchor.text().trim();

    const rawHref = anchor.attr('href') || '';
    const link = rawHref.startsWith('http')
      ? rawHref
      : `${BASE_URL}${rawHref.startsWith('/') ? '' : '/'}${rawHref}`;

    const img = $(el).find('img').first();
    const poster = img.attr('data-src') || img.attr('src') || null;

    if (title) {
      movies.push({
        title: title.trim(),
        link,
        poster
      });
    }
  });

  return movies;
}

app.get('/', (req, res) => {
  res.json({
    status: 'running',
    endpoints: [
      '/movies',
      '/search?q=keyword',
      '/details?url=movie_page_url'
    ]
  });
});

app.get('/movies', async (req, res) => {
  try {
    const { data } = await axios.get(BASE_URL, { headers: DEFAULT_HEADERS });
    const $ = cheerio.load(data);
    const movies = parseMovieList($);

    res.json({
      count: movies.length,
      movies
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to scrape movies',
      details: err.message
    });
  }
});

app.get('/search', async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    const page = parseInt(req.query.page, 10) || 1;

    if (!query) {
      return res.status(400).json({
        error: 'Please provide a search query using ?q=keyword'
      });
    }

    const { data } = await axios.get(SEARCH_API, {
      params: {
        q: query,
        query_by: 'post_title,category,stars,director,imdb_id',
        query_by_weights: '4,2,2,2,4',
        sort_by: 'sort_by_date:desc',
        limit: 15,
        highlight_fields: 'none',
        use_cache: 'true',
        page
      },
      headers: {
        ...DEFAULT_HEADERS,
        'Origin': BASE_URL,
        'Referer': `${BASE_URL}/`
      }
    });

    const hits = data.hits || [];
    const movies = hits.map((hit) => {
      const doc = hit.document || {};
      let pathname = doc.permalink || '';
      try {
        pathname = new URL(pathname, BASE_URL).pathname;
      } catch (e) {}

      return {
        title: doc.post_title || 'Unknown Title',
        link: `${BASE_URL}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
        poster: doc.post_thumbnail || null
      };
    });

    res.json({
      query,
      page,
      totalFound: data.found || movies.length,
      count: movies.length,
      movies
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to search movies',
      details: err.message
    });
  }
});

app.get('/details', async (req, res) => {
  try {
    const targetUrl = (req.query.url || '').trim();
    if (!targetUrl) {
      return res.status(400).json({
        error: 'Please provide a movie URL using ?url=...'
      });
    }

    const { data } = await axios.get(targetUrl, { headers: DEFAULT_HEADERS });
    const $ = cheerio.load(data);

    const rawTitle =
      $('meta[name="twitter:title"]').attr('content') ||
      $('h1').first().text() ||
      $('title').text();

    const title = rawTitle
      .replace(/\s+/g, ' ')
      .replace(/^[^a-zA-Z0-9]+/, '')
      .trim();

    const poster =
      $('meta[property="og:image"]').attr('content') ||
      $('main.page-body img').first().attr('src') ||
      null;

    const trailer =
      $('main.page-body iframe[src*="youtube"]').first().attr('src') || null;

    const downloadLinks = [];
    const watchLinks = [];
    let currentEpisode = '';

    $('main.page-body h3, main.page-body h4').each((i, heading) => {
      const headingText = $(heading).text().replace(/\s+/g, ' ').trim();
      const anchors = $(heading).find('a');

      const epMatch = headingText.match(/(?:episode|ep)\s*\d+/i);
      if (epMatch && anchors.length === 0) {
        currentEpisode = epMatch[0].toUpperCase();
        return;
      }

      const qualityMatch = headingText.match(/(480p|720p|1080p|2160p|4k)/i);
      const qualityPrefix = qualityMatch ? qualityMatch[0] : '';

      anchors.each((j, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        const href = $(el).attr('href') || '';

        if (!text || !href || !href.startsWith('http')) return;
        if (
          href.includes('catimages') ||
          href.includes('imdb.com') ||
          href.includes('how-to-download')
        ) {
          return;
        }

        const parts = [];
        if (currentEpisode && !text.toLowerCase().includes('ep')) {
          parts.push(currentEpisode);
        }
        if (
          qualityPrefix &&
          !text.toLowerCase().includes(qualityPrefix.toLowerCase())
        ) {
          parts.push(qualityPrefix);
        }
        parts.push(text);
        const label = parts.join(' - ');

        const lowerText = text.toLowerCase();
        const lowerHref = href.toLowerCase();

        if (
          lowerText.includes('watch') ||
          lowerText.includes('player') ||
          lowerHref.includes('hdstream4u') ||
          lowerHref.includes('hubstream')
        ) {
          watchLinks.push({ label, url: href });
        } else {
          downloadLinks.push({ label, url: href });
        }
      });
    });

    res.json({
      title,
      poster,
      trailer,
      watchLinks,
      downloadLinks
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to scrape movie details',
      details: err.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;
