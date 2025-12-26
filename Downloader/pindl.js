const axios = require('axios');

/**
 * Pinterest Downloader Scraper
 * Source: pinterestdownloader.io
 * Owners: AgungDevX
 */
const PinDL = {
    config: {
        api: 'https://pinterestdownloader.io/id-04/frontendService/DownloaderService',
        ua: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36'
    },

    /**
     * @param {String} url - Link Pinterest (pin.it atawa pinterest.com)
     */
    download: async (url) => {
        try {
            if (!url) return { status: 400, success: false, owners: "AgungDevX", message: "URL required" };

            const { data } = await axios.get(PinDL.config.api, {
                params: { url: url },
                headers: {
                    'User-Agent': PinDL.config.ua,
                    'Referer': 'https://pinterestdownloader.io/',
                    'X-Init-Locale': 'id-04'
                }
            });

            if (!data || !data.medias) throw new Error("Data not found or invalid URL");

            // Nyokot video kualitas pangluhurna atawa gambar pangalusna
            const result = {
                title: data.title || "Pinterest Media",
                thumbnail: data.thumbnail,
                source: data.source,
                media: data.medias.map(item => ({
                    url: item.url,
                    quality: item.quality,
                    extension: item.extension,
                    size: item.formattedSize,
                    type: item.extension === 'mp4' ? 'video' : 'image'
                }))
            };

            return {
                status: 200,
                success: true,
                owners: "AgungDevX",
                payload: result
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
    const testUrl = "https://pin.it/5yeybIFUA";
    const hasil = await PinDL.download(testUrl);
    console.log(JSON.stringify(hasil, null, 2));
})();

module.exports = PinDL;
