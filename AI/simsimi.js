const axios = require('axios');

class SimiPro {
    constructor() {
        this.config = {
            uid: 509694418,
            refreshToken: 'AMf-vBw4rugf0IxtWUiV2EjHGsblvtOpXVGyfGSwBhPUeIUcQWNGatozwrzcTOOVs2pJ-GfaQdNNPjj3L9d6TfUjx6gWWn4wIDuDosrAbT4B_i_Yoqe1hHkgqkpZwxwzqM61tc6u2K41L4UjxAPx2gY6TAhBjOSAIrY-dwY07aYxB78CZcgrXZJ3GEsX99AWUl-9DnFwxaKzZbqzcetLNaehNASnNlPKhztdjwoQtcVSPH4WOxNbIAEHMigg6C8MAy9rJiZ0vjACaaT2s3S-Z6FdnwVk7MAvR8nmRJNei5FCmdyaQqHeSUOI0ccHHGO7kSw2lF5BpqBKVRAAG6cfKsV5ZBDdFsbCAGGCteil3_ZXVR2BVG9RyRMJHp4mx9OhxX8q0x4IQZF6tjLrgxW8Pna-qEcU1wxGqAK9bzIG2ro9vdO4hCpNBZv5zpC5seKymSVZwU4Ce_y5',
            apiKey: 'AIzaSyBa0FW_3yQoMbSLc_9Zq03mXrUXxycPU3E',
            signature: 'db3013ce4c1b19da00661b14dcc3354eaea394bc244ee4c4aafac09c0df7b283',
            accessToken: null
        };
    }

    async refreshAuth() {
        try {
            const url = `https://securetoken.googleapis.com/v1/token?key=${this.config.apiKey}`;
            const res = await axios.post(url, {
                grant_type: 'refresh_token',
                refresh_token: this.config.refreshToken
            });
            this.config.accessToken = res.data.access_token;
            return res.data.access_token;
        } catch (err) { return null; }
    }

    // Fungsi utama pikeun nambahkeun point gratis
    async claimPoint() {
        if (!this.config.accessToken) await this.refreshAuth();
        const commonPayload = {
            uid: this.config.uid, av: "9.2.6", os: "a", lc: "id", cc: "KR", 
            tz: "Asia/Seoul", logUID: this.config.uid.toString(), reg_now_days: 0
        };
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.accessToken}`,
            'X-Signature': this.config.signature,
            'X-Client-Platform': 'web'
        };

        try {
            // Step 1: Cek & Trigger Cooldown
            await axios.post('https://kube-appserver.simsimi.com:30443/boost_chat/free_point_cooldown', commonPayload, { headers });
            // Step 2: Langsung Klaim 1000 Point
            const { data } = await axios.post('https://kube-appserver.simsimi.com:30443/boost_chat/claim_free_point', commonPayload, { headers });
            return data;
        } catch (e) { return null; }
    }

    async chat(text) {
        if (!this.config.accessToken) await this.refreshAuth();

        const payload = {
            av: "9.2.6", cc: "KR", lc: "id", logUID: this.config.uid.toString(),
            os: "a", reg_now_days: 0, tz: "Asia/Seoul", uid: this.config.uid,
            character_id: 9075, message: text, is_live_chat: false, cv: ""
        };

        try {
            const res = await axios.post('https://kube-appserver.simsimi.com:30443/ai_character/send_chat_message/stream', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Signature': this.config.signature,
                    'Authorization': `Bearer ${this.config.accessToken}`,
                    'X-Client-Platform': 'web'
                },
                responseType: 'text'
            });

            // Mun mendak error 402 (Point Beak) dina stream
            if (res.data.includes('data:402')) {
                await this.claimPoint(); // Otomatis refill
                return { 
                    status: false, 
                    creator: "AgungDevX", 
                    message: "Point beak tadi mah lur, tapi geus otomatis ku kuring di-refill. Coba nanya deui sakali deui, pasti jalan!" 
                };
            }

            const match = res.data.split('\n').find(l => l.startsWith('data: {'));
            if (match) {
                const json = JSON.parse(match.replace('data: ', ''));
                return { status: true, creator: "AgungDevX", result: json.content };
            }

            return { status: false, creator: "AgungDevX", raw: res.data };

        } catch (err) {
            if (err.response?.status === 401) {
                await this.refreshAuth();
                return this.chat(text);
            }
            return { status: false, creator: "AgungDevX", message: err.message };
        }
    }
}

// EXECUTION
const simi = new SimiPro();
const query = process.argv.slice(2).join(' ') || "Halo";

simi.chat(query).then(res => {
    process.stdout.write(JSON.stringify(res, null, 2));
});

// Hasil Json'
/**
{
  "status": true,
  "creator": "AgungDevX",
  "result": "Dih, apaan sih lo? Ga minat ah. Malu-maluin. Heleh."
}
**/