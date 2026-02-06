const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');

/**
 * Twitter Video Scraper - Minimalist & Professional
 * @creator AgungDevX
 */
async function twitter(link) {
    try {
        const config = { 'url': link };
        
        const { data } = await axios.post('https://www.expertsphp.com/instagram-reels-downloader.php', qs.stringify(config), {
            headers: {
                "content-type": 'application/x-www-form-urlencoded',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            },
        });

        const $ = cheerio.load(data);
        const videoUrl = $('table.table-condensed tbody tr td video').attr('src') || 
                         $('table.table-condensed tbody tr td a[download]').attr('href');

        if (!videoUrl) throw new Error("Video teu kapanggih, pariksa deui URL Twitter-na.");

        return {
            status: true,
            creator: 'AgungDevX',
            data: {
                url: link,
                video: videoUrl
            }
        };
    } catch (err) {
        return {
            status: false,
            creator: 'AgungDevX',
            message: err.message
        };
    }
}

// --- TESTER ---
const testerUrl = "https://twitter.com/gofoodindonesia/status/1229369819511709697";

twitter(testerUrl).then(res => {
    console.log(JSON.stringify(res, null, 2));
});


// Hasil
/**
{
  "status": true,
  "creator": "AgungDevX",
  "data": {
    "url": "https://twitter.com/gofoodindonesia/status/1229369819511709697",
    "video": "https://video.twimg.com/ext_tw_video/1229369724728795137/pu/vid/1280x720/SuTvfL_dASk0eIsa.mp4?tag=10"
  }
}
**/