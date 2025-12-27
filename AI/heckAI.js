const axios = require('axios');

/**
 * @project Heckai AI Premium Wrapper
 * @author AgungDevX
 * @version 1.0.0
 * @license MIT
 */

const Heckai = {
    config: {
        baseUrl: 'https://api.heckai.weight-wave.com/api/ha/v1',
        defaultModel: 'x-ai/grok-3-mini-beta',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Origin': 'https://api.heckai.weight-wave.com',
            'Referer': 'https://api.heckai.weight-wave.com/'
        }
    },

    /**
     * @description Nyieun session unik pikeun nyimpen konteks obrolan
     * @returns {Promise<String|null>} Session ID
     */
    async createSession() {
        try {
            const { data } = await axios.post(`${this.config.baseUrl}/session/create`, 
                { title: 'Chat_Session_' + Date.now() }, 
                { headers: this.config.headers }
            );
            return data.id || null;
        } catch (error) {
            return null;
        }
    },

    /**
     * @description Fungsi utama pikeun nanya ka AI (Streaming Reconstructor)
     * @param {Object} options - { prompt, sessionId, model }
     */
    async chat({ prompt, sessionId = null, model = null }) {
        try {
            if (!prompt) throw new Error("Parameter 'prompt' diperyogikeun.");

            const activeSession = sessionId || await this.createSession();
            const activeModel = model || this.config.defaultModel;

            const response = await axios.post(`${this.config.baseUrl}/chat`, {
                model: activeModel,
                question: prompt,
                language: 'Indonesian',
                sessionId: activeSession
            }, {
                headers: this.config.headers,
                responseType: 'text'
            });

            // Ngolah Server-Sent Events (SSE) jadi output tunggal
            const lines = response.data.split('\n');
            let resultText = '';
            let capture = false;

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const chunk = line.replace('data: ', '').trim();

                if (chunk === '[ANSWER_START]') {
                    capture = true;
                    continue;
                }
                if (chunk === '[ANSWER_DONE]') {
                    capture = false;
                    break;
                }
                if (capture) {
                    resultText += chunk;
                }
            }

            return {
                status: 200,
                success: true,
                owners: "AgungDevX",
                data: {
                    model: activeModel,
                    sessionId: activeSession,
                    answer: resultText.replace(/\\n/g, '\n').trim(),
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            return {
                status: error.response?.status || 500,
                success: false,
                owners: "AgungDevX",
                error: {
                    message: error.message,
                    details: error.response?.data || null
                }
            };
        }
    }
};

/**
 * TEST RUNNER
 * Cara make: node filename.js
 */
(async () => {
    console.log("--- [AgungDevX] Heckai Professional JSON Mode ---");
    
    // Conto nanya make model Llama-4
    const response = await Heckai.chat({
        prompt: "Sebutkeun 3 kadaharan khas Sunda nu pang ngeunahna!",
        model: "meta-llama/llama-4-scout"
    });

    console.log(JSON.stringify(response, null, 2));
})();

module.exports = Heckai;
