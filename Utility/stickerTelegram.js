const axios = require('axios');

/**
 * Telegram Sticker Set Scraper
 * Base: https://api.fstik.app/
 * Author: AgungDEV (Modified)
 */
const TgSticker = {
    config: {
        api: 'https://api.fstik.app/getStickerSetByName',
        file: 'https://api.fstik.app/file',
        agent: 'NB Android/1.0.0'
    },

    /**
     * @param {String} input - Sticker name or Telegram URL
     */
    fetch: async (input) => {
        try {
            if (!input) return { status: 400, success: false, message: "Sticker name or URL is required." };

            // Ngabersihan input tina URL Telegram
            let name = input.trim();
            if (name.includes('/addstickers/')) {
                name = name.split('/addstickers/')[1]?.split('?')[0];
            }

            const { data } = await axios.post(TgSticker.config.api, 
                { name, user_token: null }, 
                {
                    headers: {
                        'Accept': 'application/json, text/plain, */*',
                        'Content-Type': 'application/json',
                        'Origin': 'https://webapp.fstik.app',
                        'Referer': 'https://webapp.fstik.app/',
                        'User-Agent': TgSticker.config.agent
                    }
                }
            );

            const set = data?.result;
            if (!set || !set.stickers?.length) {
                return { status: 404, success: false, message: "Sticker set not found." };
            }

            // Map data stiker jadi format URL langsung
            const stickerList = set.stickers.map(s => {
                const fileId = s.thumb?.file_id ?? s.thumb?.fileid;
                return fileId ? `${TgSticker.config.file}/${fileId}/sticker.webp` : null;
            }).filter(Boolean);

            const disclaimer = "\n\n---\nEducational Purpose Only\nScript ini dibagikan untuk tujuan riset pengembangan bot, edukasi protokol API, dan pengembangan perangkat lunak (Software Development).";

            return {
                status: 200,
                success: true,
                payload: {
                    title: set.title || name,
                    total: stickerList.length,
                    stickers: stickerList
                },
                description: "Telegram Sticker Downloader Service" + disclaimer
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
    console.log("Fetching Telegram stickers...");
    // Ganti ku ngaran set stiker nu hayang di-test
    const result = await TgSticker.fetch("https://t.me/addstickers/BoysClub");
    console.log(JSON.stringify(result, null, 2));
})();

module.exports = TgSticker;