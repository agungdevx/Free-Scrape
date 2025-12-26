const axios = require("axios");
const cheerio = require("cheerio");

/**
 * Telegram Channel Search Scraper
 * Base: https://tgramsearch.com/
 * Author: gienetic (Modified by Agung)
 */
const TgSearch = {
    config: {
        base: "https://en.tgramsearch.com",
        agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36"
    },

    // Fungsi internal pikeun resolusi link t.me asli
    _resolveLink: async (joinUrl) => {
        try {
            const { data } = await axios.get(joinUrl, {
                headers: { "User-Agent": TgSearch.config.agent }
            });
            const $ = cheerio.load(data);
            const tgResolve = $('a[href^="tg://resolve"]').attr("href");

            if (tgResolve) {
                const username = tgResolve.split("tg://resolve?domain=")[1];
                return `https://t.me/${username}`;
            }
        } catch (e) {
            return joinUrl;
        }
        return joinUrl;
    },

    // Fungsi utama pikeun milari channel
    search: async (query) => {
        try {
            if (!query) return { status: 400, success: false, message: "Query is required." };

            const searchUrl = `${TgSearch.config.base}/search?query=${encodeURIComponent(query)}`;
            const { data } = await axios.get(searchUrl, {
                headers: { "User-Agent": TgSearch.config.agent }
            });

            const $ = cheerio.load(data);
            const channels = [];
            const elements = $(".tg-channel-wrapper").toArray();

            for (const el of elements) {
                const name = $(el).find(".tg-channel-link a").text().trim();
                let link = $(el).find(".tg-channel-link a").attr("href");
                const image = $(el).find(".tg-channel-img img").attr("src");
                const members = $(el).find(".tg-user-count").text().trim();
                const description = $(el).find(".tg-channel-description").text().trim();
                const category = $(el).find(".tg-channel-categories a").text().trim();

                // Konversi link ka format t.me
                if (link?.startsWith("/join/")) {
                    link = await TgSearch._resolveLink(`${TgSearch.config.base}${link}`);
                } else if (link?.startsWith("tg://resolve?domain=")) {
                    const username = link.split("tg://resolve?domain=")[1];
                    link = `https://t.me/${username}`;
                }

                channels.push({
                    name,
                    link,
                    image,
                    members,
                    description: description || null,
                    category: category || "Uncategorized"
                });
            }

            const disclaimer = "\n\n---\nEducational Purpose Only\nScript ini digunakan untuk tujuan riset pengembangan teknologi perayapan web (web crawling) dan edukasi pengolahan data.";

            return {
                status: 200,
                success: true,
                payload: {
                    query: query,
                    total_results: channels.length,
                    results: channels
                },
                description: "Telegram Search AI Interface" + disclaimer
            };

        } catch (err) {
            return {
                status: 500,
                success: false,
                message: err.message
            };
        }
    }
};

// --- RUN TEST ON TERMUX ---
(async () => {
    console.log("Searching Telegram channels...");
    const result = await TgSearch.search("teknologi");
    console.log(JSON.stringify(result, null, 2));
})();

module.exports = TgSearch;