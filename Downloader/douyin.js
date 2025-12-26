const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');

/**
 * SaveTik Scraper (Douyin & TikTok Downloader)
 * Owners: AgungDevX
 */
const SaveTik = {
    config: {
        api: 'https://savetik.co/api/ajaxSearch',
        ua: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36'
    },

    /**
     * @param {String} url - Link Douyin atawa TikTok
     */
    download: async (url) => {
        try {
            if (!url) return { status: 400, success: false, owners: "AgungDevX", message: "URL diperyogikeun!" };

            // 1. Kirim POST request make format x-www-form-urlencoded
            const { data: response } = await axios.post(SaveTik.config.api, qs.stringify({
                q: url,
                lang: 'id',
                cftoken: ''
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Accept': '*/*',
                    'X-Requested-With': 'XMLHttpRequest',
                    'User-Agent': SaveTik.config.ua,
                    'Origin': 'https://savetik.co',
                    'Referer': 'https://savetik.co/id'
                }
            });

            if (response.status !== 'ok') throw new Error("Gagal nyokot data ti SaveTik.");

            // 2. Parsing HTML nu aya di jero JSON response
            const $ = cheerio.load(response.data);
            
            const result = {
                title: $('.content h3').text().trim() || "Douyin/TikTok Video",
                thumbnail: $('.image-tik img').attr('src'),
                media: {
                    video_render: $('.action-convert').attr('data-audiourl'), // Biasana link video aya didieu
                    mp3: $('.tik-button-dl.button.dl-success').attr('href'),
                    images: []
                }
            };

            // 3. Mun aya daptar gambar (pikeun Douyin Slide/Foto)
            $('.photo-list ul li').each((i, el) => {
                const imgUrl = $(el).find('.download-items__btn a').attr('href');
                if (imgUrl) {
                    result.media.images.push({
                        index: i + 1,
                        url: imgUrl
                    });
                }
            });

            const disclaimer = "\n\n---\nScraper ku AgungDevX. Pake kalawan bijak, ulah sagawayah!";

            return {
                status: 200,
                success: true,
                owners: "AgungDevX",
                payload: result,
                description: "SaveTik Multi-Downloader Service" + disclaimer
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

// --- CARA JALANKEUN (TEST RUN) ---
(async () => {
    console.log("--- [AgungDevX] Keur ngeruk Douyin... ---");
    const testUrl = "https://v.douyin.com/ieWfMQA1/";
    const res = await SaveTik.download(testUrl);
    console.log(JSON.stringify(res, null, 2));
})();

module.exports = SaveTik;
