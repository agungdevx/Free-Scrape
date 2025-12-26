const axios = require('axios');
const cheerio = require('cheerio');

const SnapTikScraper = {
    _base: 'https://albertaibdconsortium.ca/',
    
    async download(tiktokUrl) {
        if (!tiktokUrl) return { success: false, message: 'URL_REQUIRED' };

        try {
            const { data } = await axios({
                method: 'POST',
                url: this._base,
                headers: {
                    'HX-Request': 'true',
                    'HX-Current-URL': this._base,
                    'HX-Boosted': 'true',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                data: new URLSearchParams({ url: tiktokUrl }).toString()
            });

            const $ = cheerio.load(data);
            
            // Extract Metadata
            const title = $('p.mt-2.line-clamp-3').text().trim();
            const author = $('h3.mt-6').text().trim();
            const thumbnail = $('img.h-40.w-40').attr('src');

            // Extract Links (MP4 & MP3)
            const links = [];
            $('a[href^="https://"]').each((_, el) => {
                const href = $(el).attr('href');
                const text = $(el).text().toLowerCase();
                
                let type = 'video';
                if (text.includes('mp3')) type = 'audio';
                
                if (href.includes('token=')) {
                    links.push({
                        type: type,
                        label: $(el).text().trim(),
                        url: href
                    });
                }
            });

            return {
                status: 200,
                success: true,
                payload: {
                    source: tiktokUrl,
                    metadata: {
                        author,
                        title,
                        thumbnail
                    },
                    media: {
                        video: links.find(l => l.type === 'video')?.url || null,
                        audio: links.find(l => l.type === 'audio')?.url || null,
                        all_links: links
                    }
                }
            };

        } catch (err) {
            return {
                status: err.response?.status || 500,
                success: false,
                message: err.message
            };
        }
    }
};

// --- RUN TEST ---
(async () => {
    const target = process.argv[2] || 'https://www.tiktok.com/@cikaseiska/video/7379107227363200261';
    const result = await SnapTikScraper.download(target);
    console.log(JSON.stringify(result, null, 2));
})();
