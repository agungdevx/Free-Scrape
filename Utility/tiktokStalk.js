const axios = require('axios');

/**
 * TokViewer TikTok Stalker & Downloader Scraper
 * Source: tokviewer.net
 * Owners: AgungDevX
 */
const TokStalk = {
    config: {
        baseUrl: "https://tokviewer.net/api",
        headers: {
            'accept': 'application/json, text/plain, */*',
            'content-type': 'application/json',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'origin': 'https://tokviewer.net',
            'referer': 'https://tokviewer.net/'
        }
    },

    /**
     * @param {String} username - Username TikTok nu rék ditalungtik (misal: tzy_how)
     */
    stalk: async (username) => {
        try {
            if (!username) return { status: 400, success: false, owners: "AgungDevX", message: "Username-na mana, mang?" };

            // 1. Candak Data Profil
            const profileRes = await axios.post(`${TokStalk.config.baseUrl}/check-profile`, 
                { username: username }, 
                { headers: TokStalk.config.headers }
            );

            const profile = profileRes.data;
            if (profile.status !== 200 || !profile.data) {
                throw new Error("Profil teu kapanggih atawa server TokViewer keur rungsing.");
            }

            // 2. Candak Data Video (10 video panganyarna)
            const videoRes = await axios.post(`${TokStalk.config.baseUrl}/video`, 
                { username: username, offset: 0, limit: 10 }, 
                { headers: TokStalk.config.headers }
            );

            const videos = videoRes.data;

            return {
                status: 200,
                success: true,
                owners: "AgungDevX",
                result: {
                    user: {
                        username: username,
                        avatar: profile.data.avatar,
                        followers: profile.data.followers,
                        following: profile.data.following,
                        likes: profile.data.likes,
                        sec_uid: profile.data.sec_uid
                    },
                    videos: (videos.data || []).map(v => ({
                        cover: v.cover,
                        downloadUrl: v.downloadUrl,
                        type: v.downloadUrl.includes('.mp3') ? 'music/photo_mode' : 'video'
                    })),
                    hasMore: videos.has_more || false
                }
            };

        } catch (err) {
            return {
                status: 500,
                success: false,
                owners: "AgungDevX",
                message: err.response?.data?.message || err.message
            };
        }
    }
};

// --- TEST RUN ---
(async () => {
    console.log("--- [AgungDevX] TokViewer Stalker Test ---");
    const res = await TokStalk.stalk("tzy_how");
    console.log(JSON.stringify(res, null, 2));
})();

module.exports = TokStalk;
