/**
 * By : AgungDEV
 * TikWM Search Scraper - Photo/Video Mode
 */

const axios = require('axios');

class TikTokSearch {
  constructor() {
    this.api = 'https://tikwm.com/api/photo/search';
    this.headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
  }

  /**
   * Fungsi néangan kontén di TikTok
   * @param {string} keywords - Kecap konci (misal: "Cosplay")
   * @param {number} cursor - Titik mimiti (offset)
   */
  async search(keywords, cursor = 0) {
    try {
      // Nyusun body pamenta (URLSearchParams meh otomatis encoded)
      const params = new URLSearchParams();
      params.append('keywords', keywords);
      params.append('count', 12);
      params.append('cursor', cursor);
      params.append('web', 1);
      params.append('hd', 1);

      const response = await axios.post(this.api, params.toString(), {
        headers: this.headers
      });

      const res = response.data;

      if (res.code !== 0) {
        throw new Error(res.msg || "Server TikWM keur ngadat!");
      }

      // Nyaring data meh beresih
      const formattedData = res.data.videos.map(v => ({
        id: v.video_id,
        title: v.title,
        region: v.region,
        author: {
          username: v.author.unique_id,
          nickname: v.author.nickname,
          avatar: `https://tikwm.com${v.author.avatar}`
        },
        media: {
          no_watermark: `https://tikwm.com${v.play}`,
          with_watermark: `https://tikwm.com${v.wmplay}`,
          music: `https://tikwm.com${v.music}`,
          images: v.images || [] // Bakal aya eusi mun mode poto
        },
        stats: {
          play: v.play_count,
          like: v.digg_count,
          comment: v.comment_count,
          share: v.share_count
        }
      }));

      return {
        status: true,
        author: "AgungDEV",
        total: formattedData.length,
        next_cursor: res.data.cursor,
        results: formattedData
      };

    } catch (e) {
      return {
        status: false,
        author: "AgungDEV",
        error: e.message
      };
    }
  }
}

// ================= EKSEKUSI RAPIH =================
(async () => {
  const tk = new TikTokSearch();
  const keyword = "Cosplay";

  console.log(`[AgungDevx] Néangan kontén TikTok: "${keyword}"...`);
  const hasil = await tk.search(keyword);

  // Hasil JSON rapih muncraat
  console.log(JSON.stringify(hasil, null, 2));
})();
