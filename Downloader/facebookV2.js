const axios = require('axios');

async function fbDown(url) {
    try {
        // Headers nu leuwih mirip Browser asli
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Sec-Fetch-Mode': 'navigate',
            'Cookie': 'sb=1; datr=1;' // Cookie minimalis keur ngecoh bot-detection
        };

        // Paké request biasa heula keur neangan URL asli mun aya redirect
        const response = await axios.get(url, { 
            headers, 
            timeout: 15000,
            maxRedirects: 10 
        });

        const html = response.data;

        // Regex keur neangan link video dina tumpukan kode Facebook
        const findUrl = (regex) => {
            const match = html.match(regex);
            if (match && match[1]) {
                return match[1]
                    .replace(/\\\//g, '/')
                    .replace(/\\u0025/g, '%')
                    .replace(/\\u0026/g, '&');
            }
            return null;
        };

        const hd = findUrl(/"browser_native_hd_url":"([^"]+)"/) || findUrl(/"playable_url_quality_hd":"([^"]+)"/);
        const sd = findUrl(/"browser_native_sd_url":"([^"]+)"/) || findUrl(/"playable_url":"([^"]+)"/);
        const title = html.match(/<title>(.*?)<\/title>/)?.[1]?.split(' | ')[0] || "Facebook Video";

        if (!hd && !sd) {
            return {
                creator: "@ShiroNexo",
                status: false,
                message: "Video teu kapanggih. Facebook keur proteksi, coba ganti IP/VPN."
            };
        }

        return {
            creator: "@ShiroNexo",
            status: true,
            title,
            hd,
            sd
        };

    } catch (err) {
        return {
            creator: "@ShiroNexo",
            status: false,
            message: err.response ? `Error ${err.response.status}: Facebook nolak request.` : err.message
        };
    }
}

const tester = "https://www.facebook.com/share/r/1WCkXg8fsT/";

fbDown(tester).then(res => {
    console.log(JSON.stringify(res, null, 2));
});
