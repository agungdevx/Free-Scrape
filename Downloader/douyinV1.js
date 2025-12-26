const axios = require('axios');

/**
 * Seekin AI Media Downloader Scraper
 * Engine: Seekin API (Douyin Support)
 * Owners: AgungDevX
 */
const Seekin = {
    config: {
        api: 'https://api.seekin.ai/ikool/media/download',
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },

    /**
     * @param {String} url - Link Douyin/TikTok
     */
    download: async (url) => {
        try {
            if (!url) return { status: 400, success: false, owners: "AgungDevX", message: "URL diperyogikeun!" };

            // Ieu data sign jeung timestamp tina hasil scrap maneh
            // Mun engke 403, hartina sign ieu geus kadaluwarsa
            const payload = { url: url };
            
            const { data } = await axios.post(Seekin.config.api, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'lang': 'en',
                    'timestamp': '1766750360505',
                    'sign': 'a90f96ca8fc1307461574c3313ebf03582a5d942f87f51266043f8f0be2ca6b7',
                    'User-Agent': Seekin.config.ua,
                    'Origin': 'https://seekin.ai',
                    'Referer': 'https://seekin.ai/'
                }
            });

            if (data.code !== "0000") {
                throw new Error(data.msg || "Gagal nyokot data ti Seekin AI.");
            }

            const res = data.data;

            return {
                status: 200,
                success: true,
                owners: "AgungDevX",
                payload: {
                    title: res.title || "Douyin Media",
                    thumbnail: res.imageUrl,
                    duration: res.duration,
                    media: res.medias, // Pikeun video mun aya
                    images: res.images.map(img => ({
                        url: img.url,
                        format: img.format
                    }))
                },
                description: "Professional AI Media Scraper by AgungDevX"
            };

        } catch (err) {
            return {
                status: 500,
                success: false,
                owners: "AgungDevX",
                message: err.message
            };
        }
    }
};

// --- RUN TEST ---
(async () => {
    console.log("--- [AgungDevX] Seekin AI Downloader ---");
    const link = "https://v.douyin.com/ieWfMQA1/";
    const result = await Seekin.download(link);
    console.log(JSON.stringify(result, null, 2));
})();

module.exports = Seekin;
