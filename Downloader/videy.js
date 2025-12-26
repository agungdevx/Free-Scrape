/**
 * @project Videy.co Scraper Test
 * @author AgungDEV
 */

const axios = require('axios');

const VideyProvider = {
    _headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
    },

    /**
     * Resolve direct link and metadata
     * @param {string} url 
     */
    resolve: async (url) => {
        try {
            // Validasi format URL
            if (!url.includes('id=')) {
                return { status: 400, success: false, message: 'INVALID_URL_FORMAT' };
            }

            const id = url.split('id=')[1];
            const directUrl = `https://cdn.videy.co/${id}.mp4`;

            // Fetching Metadata (Headers Only)
            const head = await axios.head(directUrl, {
                headers: VideyProvider._headers,
                timeout: 10000
            });

            const sizeBytes = parseInt(head.headers['content-length'] || 0, 10);
            const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);

            return {
                status: 200,
                success: true,
                payload: {
                    id: id,
                    direct_link: directUrl,
                    mime_type: head.headers['content-type'],
                    size: `${sizeMB} MB`,
                    fetched_at: new Date().toISOString()
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

// --- TEST EXECUTION ---
(async () => {
    // Ambil URL dari argumen terminal atau gunakan default untuk test
    const targetUrl = process.argv[2] || 'https://videy.co/v/?id=MD4QKKQt1';
    
    console.log(`[SYSTEM] FETCHING: ${targetUrl}`);
    
    const result = await VideyProvider.resolve(targetUrl);
    console.log(JSON.stringify(result, null, 2));
})();