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


/** Bonus sama aja sih result url nya cuman beda domain web doang jadikan fallback aja kalo domain yang atas Mokad ada gantinya ini

const axios = require('axios');
const cheerio = require('cheerio');

const SavePin = {
    config: {
        api: 'https://savepinmedia.com/php/api/api.php',
        baseUrl: 'https://savepinmedia.com',
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },

    download: async (url) => {
        try {
            if (!url) return { status: 400, success: false, owners: "AgungDevX", message: "URL required" };

            const { data } = await axios.get(SavePin.config.api, {
                params: { url: url },
                headers: {
                    'Accept': '*/*',
                    'X-Requested-With': 'XMLHttpRequest',
                    'User-Agent': SavePin.config.ua,
                    'Referer': 'https://savepinmedia.com/'
                }
            });

            const $ = cheerio.load(data);

            // Ngeruk data tina elemen HTML
            const result = {
                author: {
                    name: $('.info span a').text() || "Unknown",
                    profile: $('.info span a').attr('href') || "",
                    avatar: $('.photo img').attr('src') || ""
                },
                thumbnail: $('.load-screenshot').css('background')?.match(/url\((.*?)\)/)?.[1] || "",
                media: []
            };

            // Ngumpulkeun kabeh link download nu aya
            $('.button-download a').each((i, el) => {
                const rawHref = $(el).attr('href');
                if (rawHref) {
                    // Meresihan link download (ngaleungitkeun wrapper internal)
                    const directLink = rawHref.includes('id=') ? decodeURIComponent(rawHref.split('id=')[1]) : SavePin.config.baseUrl + rawHref;
                    
                    result.media.push({
                        url: directLink,
                        type: directLink.includes('.mp4') ? 'video' : 'image'
                    });
                }
            });

            if (result.media.length === 0) throw new Error("Media not found on this page.");

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
    const link = "https://pin.it/5yeybIFUA";
    const res = await SavePin.download(link);
    console.log(JSON.stringify(res, null, 2));
})();

module.exports = SavePin;
**/
