const axios = require('axios');
const FormData = require('form-data');

/**
 * AiLabs Text-to-Image & Video Scraper
 * Bypass Cipher Token Encryption
 * Owners: AgungDevX
 */
const AiLabs = {
    config: {
        base: 'https://text2video.aritek.app',
        cipher: 'hbMcgZLlzvghRlLbPcTbCpfcQKM0PcU0zhPcTlOFMxBZ1oLmruzlVp9remPgi0QWP0QW',
        shift: 3,
        ua: 'NB Android/1.0.0'
    },

    // Fungsi internal pikeun ngabongkar kode rahasia token
    _decryptToken: () => {
        const input = AiLabs.config.cipher;
        const shift = AiLabs.config.shift;
        return [...input].map(c =>
            /[a-z]/.test(c) ? String.fromCharCode((c.charCodeAt(0) - 97 - shift + 26) % 26 + 97) :
            /[A-Z]/.test(c) ? String.fromCharCode((c.charCodeAt(0) - 65 - shift + 26) % 26 + 65) : c
        ).join('');
    },

    /**
     * Generate Gambar (Text to Image)
     */
    text2img: async (prompt) => {
        try {
            if (!prompt) return { status: 400, success: false, message: "Prompt mana mang?" };
            
            const token = AiLabs._decryptToken();
            const form = new FormData();
            form.append('prompt', prompt);
            form.append('token', token);

            const { data } = await axios.post(`${AiLabs.config.base}/text2img`, form, {
                headers: {
                    'user-agent': AiLabs.config.ua,
                    'authorization': token,
                    ...form.getHeaders()
                }
            });

            if (data.code !== 0 || !data.url) throw new Error("Gagal generate gambar euy.");

            return {
                status: 200,
                success: true,
                owners: "AgungDevX",
                result: { url: data.url.trim(), prompt }
            };
        } catch (err) {
            return { status: 500, success: false, owners: "AgungDevX", message: err.message };
        }
    },

    /**
     * Generate Video (Text to Video)
     * Prosesna rada lila, kudu polling (cek berkala)
     */
    text2video: async (prompt) => {
        try {
            if (!prompt) return { status: 400, success: false, message: "Promptna tong kosong!" };
            
            const token = AiLabs._decryptToken();
            const payload = {
                deviceID: Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10),
                isPremium: 1,
                prompt: prompt,
                used: [],
                versionCode: 59
            };

            // Step 1: Request Key Video
            const resKey = await axios.post(`${AiLabs.config.base}/txt2videov3`, payload, {
                headers: { 'user-agent': AiLabs.config.ua, 'authorization': token, 'content-type': 'application/json' }
            });

            if (resKey.data.code !== 0 || !resKey.data.key) throw new Error("Gagal meunangkeun antrian video.");

            const key = resKey.data.key;
            
            // Step 2: Polling (Nungguan video jadi)
            let videoUrl = null;
            let attempts = 0;
            
            while (!videoUrl && attempts < 30) { // Max 30 kali cek (kurang leuwih 1 menit)
                attempts++;
                const resVideo = await axios.post(`${AiLabs.config.base}/video`, { keys: [key] }, {
                    headers: { 'user-agent': AiLabs.config.ua, 'authorization': token }
                });

                const videoData = resVideo.data.datas?.[0];
                if (videoData?.url) {
                    videoUrl = videoData.url.trim();
                } else {
                    await new Promise(resolve => setTimeout(resolve, 3000)); // Tungguan 3 detik sakali cek
                }
            }

            if (!videoUrl) throw new Error("Serverna tunduh, videona lila teuing jadi.");

            return {
                status: 200,
                success: true,
                owners: "AgungDevX",
                result: { url: videoUrl, prompt }
            };

        } catch (err) {
            return { status: 500, success: false, owners: "AgungDevX", message: err.message };
        }
    }
};

// --- TEST RUN ---
(async () => {
    console.log("--- [AgungDevX] AiLabs AI Generator ---");
    // Ganti jadi text2video mun hayang nyoba video
    const res = await AiLabs.text2video("A beautiful Sundanese girl in the forest");
    console.log(JSON.stringify(res, null, 2));
})();

module.exports = AiLabs;
