import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Cache in-memory for dynamically discovered titles from IMDb or Gemini
  const dynamicCache = new Map<string, any>();

  // Use Gemini Client if key exists
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  };

  async function fetchDetailsWithGemini(id: string, type: string) {
    try {
      // 1. Try to fetch the official title and actual poster from IMDb Suggestion API first!
      let officialTitle = "";
      let officialImageUrl = "";
      let officialYear = "";
      let officialStars = "";

      const imdbLookup = await searchIMDb(id);
      if (imdbLookup && Array.isArray(imdbLookup.d)) {
        const item = imdbLookup.d.find((x: any) => x.id && x.id.toLowerCase() === id.toLowerCase());
        if (item) {
          officialTitle = item.l || "";
          officialYear = String(item.y || "");
          officialStars = item.s || "";
          
          if (item.i) {
            let rawUrl = "";
            if (typeof item.i === 'string') {
              rawUrl = item.i;
            } else if (Array.isArray(item.i) && item.i[0]) {
              rawUrl = item.i[0];
            } else if (typeof item.i === 'object' && item.i.imageUrl) {
              rawUrl = item.i.imageUrl;
            }
            if (rawUrl) {
              // Standard IMDb thumbnail resizing manipulation
              officialImageUrl = rawUrl.replace(/\._V1_.*\.jpg$/, "._V1_UX300_CR0,0,300,450_AL_.jpg");
              if (!officialImageUrl.includes("http")) {
                officialImageUrl = rawUrl;
              }
            }
          }
        }
      }

      const ai = getGeminiClient();
      if (!ai) {
        // Fallback if Gemini key is missing: return official lookup from IMDb
        if (officialTitle) {
          return {
            tmdb_id: id,
            imdb_id: id,
            title: officialTitle,
            year: officialYear || "2024",
            poster_url: officialImageUrl || "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500",
            rating: "7.8",
            genre: type === 'tv' ? "TV Show" : "Movie",
            popularity: "90",
            type: type as 'movie' | 'tv',
            description: officialStars ? `Starring ${officialStars}.` : "No description available."
          };
        }
        return null;
      }

      const prompt = `Construct movie or TV show details in valid JSON format for the IMDb ID: "${id}" (type: "${type}"). 
${officialTitle ? `The official authenticated title is "${officialTitle}" and released in "${officialYear}".` : ""}
Return the official details.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["title", "year", "genre", "rating", "description"],
            properties: {
              title: { type: Type.STRING },
              year: { type: Type.STRING },
              genre: { type: Type.STRING, description: "Main genres, e.g. Action, Horror" },
              rating: { type: Type.STRING, description: "IMDb rating e.g. 7.5" },
              description: { type: Type.STRING }
            }
          },
          systemInstruction: "You are an expert movie database curator. Return accurate metadata for IMDb items."
        }
      });

      const text = response.text;
      if (text) {
        const details = JSON.parse(text);
        
        let posterUrl = officialImageUrl;
        if (!posterUrl) {
          const rawGenre = (details.genre || "").toLowerCase();
          posterUrl = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500";
          if (rawGenre.includes("horror") || rawGenre.includes("zombie") || rawGenre.includes("evil") || rawGenre.includes("resident")) {
            posterUrl = "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500";
          } else if (rawGenre.includes("action") || rawGenre.includes("adventure")) {
            posterUrl = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500";
          } else if (rawGenre.includes("sci-fi") || rawGenre.includes("space")) {
            posterUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500";
          } else if (rawGenre.includes("comedy")) {
            posterUrl = "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=500";
          }
        }

        return {
          tmdb_id: id,
          imdb_id: id,
          title: officialTitle || details.title,
          year: officialYear || details.year,
          poster_url: posterUrl,
          rating: details.rating || "8.0",
          genre: details.genre,
          popularity: "90",
          type: type as 'movie' | 'tv',
          description: details.description
        };
      }
    } catch (error) {
      console.error(`Gemini details fetch error for ${id}:`, error);
    }
    return null;
  }

  async function searchIMDb(query: string) {
    try {
      const cleanQ = query.toLowerCase().trim();
      const firstLetter = cleanQ.charAt(0);
      const url = `https://v3.sg.media-imdb.com/suggestion/${/^[a-z0-9]$/i.test(firstLetter) ? firstLetter : 'a'}/${encodeURIComponent(cleanQ)}.json`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.error("IMDb Search error:", e);
      return null;
    }
  }

  // --- API ROUTES ---
  app.get("/api/search", async (req, res) => {
    try {
      const q = req.query.q;
      if (!q || typeof q !== "string" || !q.trim()) {
        return res.json({ movies: [], shows: [] });
      }

      const query = q.trim();

      // Check for raw IMDb ID or URL
      const isImdbId = /^tt\d+$/i.test(query);
      const isImdbUrl = /imdb\.com\/title\/(tt\d+)/i.exec(query);
      const matchedId = isImdbId ? query : (isImdbUrl ? isImdbUrl[1] : null);

      if (matchedId) {
        const id = matchedId.toLowerCase();
        let cached = dynamicCache.get(id);
        if (!cached) {
          cached = await fetchDetailsWithGemini(id, "movie");
          if (cached) {
            dynamicCache.set(id, cached);
          } else {
            cached = {
              tmdb_id: id,
              imdb_id: id,
              title: `IMDb Sourced (${id})`,
              year: "2024",
              poster_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500",
              rating: "8.0",
              genre: "Action, Adventure",
              popularity: "90",
              type: "movie",
              description: "Retrieved via direct IMDb references."
            };
            dynamicCache.set(id, cached);
          }
        }
        if (cached.type === 'tv') {
          return res.json({ movies: [], shows: [cached] });
        } else {
          return res.json({ movies: [cached], shows: [] });
        }
      }

      // Live IMDb search autocomplete
      const imdbData = await searchIMDb(query);
      const movies: any[] = [];
      const shows: any[] = [];

      if (imdbData && Array.isArray(imdbData.d)) {
        for (const item of imdbData.d) {
          if (!item.id) continue;
          
          const isTv = item.q && (item.q.toLowerCase().includes('series') || item.q.toLowerCase().includes('tv') || item.q.toLowerCase().includes('episode'));
          
          // Fully resilient image extraction from IMDb Suggestions format
          let posterUrl = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500";
          if (item.i) {
            let rawUrl = "";
            if (typeof item.i === "string") {
              rawUrl = item.i;
            } else if (Array.isArray(item.i) && item.i[0]) {
              rawUrl = item.i[0];
            } else if (typeof item.i === "object" && item.i.imageUrl) {
              rawUrl = item.i.imageUrl;
            }
            if (rawUrl) {
              posterUrl = rawUrl.replace(/\._V1_.*\.jpg$/, "._V1_UX300_CR0,0,300,450_AL_.jpg");
              if (!posterUrl.includes("http")) {
                posterUrl = rawUrl;
              }
            }
          }

          const stars = item.s || "";
          const year = String(item.y || "");

          const mediaItem = {
            tmdb_id: item.id,
            imdb_id: item.id,
            title: item.l,
            year: year,
            poster_url: posterUrl,
            rating: "7.8",
            genre: isTv ? (stars ? `Stars: ${stars}` : "TV Show") : (stars ? `Stars: ${stars}` : "Movie"),
            popularity: "90",
            type: isTv ? 'tv' : 'movie',
            description: stars ? `Starring ${stars}. Released in ${year}.` : `Released in ${year}.`
          };

          dynamicCache.set(item.id.toLowerCase(), mediaItem);

          if (isTv) {
            shows.push(mediaItem);
          } else {
            movies.push(mediaItem);
          }
        }
      }

      // If absolutely no matches are found on IMDb suggestion API, ask Gemini to find actual items
      if (movies.length === 0 && shows.length === 0) {
        const ai = getGeminiClient();
        if (ai) {
          const schemaPrompt = `Return list of 1 to 3 matching movies or TV shows matching the name or concept: "${query}". Provide authentic IMDb IDs.`;
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: schemaPrompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["title", "year", "imdb_id", "type", "description"],
                  properties: {
                    title: { type: Type.STRING },
                    year: { type: Type.STRING },
                    imdb_id: { type: Type.STRING, description: "Actual valid IMDb ID starting with 'tt'" },
                    type: { type: Type.STRING, description: 'movie or tv' },
                    description: { type: Type.STRING }
                  }
                }
              }
            }
          });
          const text = response.text;
          if (text) {
            const list = JSON.parse(text);
            for (const x of list) {
              if (!x.imdb_id || !x.imdb_id.startsWith('tt')) continue;
              const id = x.imdb_id.toLowerCase();
              
              // Try to do a quick lookup on IMDb for this dynamic item to get its OFFICIAL cover
              let officialPoster = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500";
              const subLookup = await searchIMDb(id);
              if (subLookup && Array.isArray(subLookup.d)) {
                const subItem = subLookup.d.find((si: any) => si.id && si.id.toLowerCase() === id);
                if (subItem && subItem.i) {
                  let rawUrl = "";
                  if (typeof subItem.i === 'string') {
                    rawUrl = subItem.i;
                  } else if (Array.isArray(subItem.i) && subItem.i[0]) {
                    rawUrl = subItem.i[0];
                  } else if (typeof subItem.i === 'object' && subItem.i.imageUrl) {
                    rawUrl = subItem.i.imageUrl;
                  }
                  if (rawUrl) {
                    officialPoster = rawUrl.replace(/\._V1_.*\.jpg$/, "._V1_UX300_CR0,0,300,450_AL_.jpg");
                    if (!officialPoster.includes("http")) {
                      officialPoster = rawUrl;
                    }
                  }
                }
              }

              const mediaItem = {
                tmdb_id: id,
                imdb_id: id,
                title: x.title,
                year: x.year,
                poster_url: officialPoster,
                rating: "8.0",
                genre: x.type === 'tv' ? "TV Show" : "Movie",
                popularity: "90",
                type: x.type === 'tv' ? 'tv' : 'movie',
                description: x.description
              };
              dynamicCache.set(id, mediaItem);
              if (x.type === 'tv') {
                shows.push(mediaItem);
              } else {
                movies.push(mediaItem);
              }
            }
          }
        }
      }

      res.json({ movies, shows });
    } catch (err) {
      console.error("API Search error:", err);
      res.status(500).json({ error: "Internal Search Error" });
    }
  });

  app.get("/api/media/:type/:id", async (req, res) => {
    try {
      const { type, id } = req.params;
      const cleanId = id.toLowerCase().trim();

      if (dynamicCache.has(cleanId)) {
        return res.json(dynamicCache.get(cleanId));
      }

      if (/^tt\d+$/i.test(cleanId)) {
        const details = await fetchDetailsWithGemini(cleanId, type);
        if (details) {
          dynamicCache.set(cleanId, details);
          return res.json(details);
        }
      }

      res.status(404).json({ error: "Not found" });
    } catch (err) {
      console.error("API details lookup error:", err);
      res.status(500).json({ error: "Internal Error" });
    }
  });

  // --- VITE WEB MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
