const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * Venice AI Uncensored Scraper
 * Base: https://venice.ai/
 * Format: Clean JSON Output
 */
const VeniceAI = {
    config: {
        base: 'https://outerface.venice.ai/api/inference/chat',
        agent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
    },

    // Ngahasilkeun versi dinamis pikeun header
    _getVersion: () => {
        const d = new Date();
        const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
        return `interface@${dateStr}.230844+7989322`;
    },

    // Ngahasilkeun ID unik saderhana
    _genId: () => uuidv4().replace(/-/g, '').substring(0, 12),

    /**
     * @param {String} prompt - Pertanyaan user
     * @param {Array} history - Riwayat obrolan (opsional)
     * @param {String} model - Model ID (default: dolphin-3.0-mistral-24b)
     */
    chat: async (prompt, history = [], model = 'dolphin-3.0-mistral-24b') => {
        try {
            if (!prompt) return { status: 400, success: false, message: "Prompt is required." };

            const payload = {
                requestId: VeniceAI._genId(),
                conversationType: "text",
                type: "text",
                modelId: model,
                modelName: "Venice Uncensored",
                modelType: "text",
                prompt: [...history, { content: prompt, role: "user" }],
                systemPrompt: "",
                messageId: VeniceAI._genId(),
                includeVeniceSystemPrompt: true,
                isCharacter: false,
                userId: `user_anon_${Math.floor(Math.random() * 1e9)}`,
                simpleMode: false,
                webEnabled: true,
                reasoning: true
            };

            const { data } = await axios.post(VeniceAI.config.base, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Venice-Version': VeniceAI._getVersion(),
                    'User-Agent': VeniceAI.config.agent,
                    'Referer': 'https://venice.ai/'
                }
            });

            // Ngolah data stream jadi tÃ©ks beresih
            const lines = data.split('\n').filter(l => l.trim() !== '');
            let fullText = "";
            let references = [];

            for (const line of lines) {
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.kind === 'content' && parsed.content) {
                        fullText += parsed.content;
                    } else if (parsed.kind === 'meta' && parsed.references) {
                        references = parsed.references;
                    }
                } catch (e) {
                    continue;
                }
            }

            const disclaimer = "\n\n---\nEducational Purpose Only\nScript ini dibagikan untuk tujuan riset pengembangan teknologi AI dan edukasi pemrograman.";

            return {
                status: 200,
                success: true,
                payload: {
                    model_id: model,
                    input: prompt,
                    result: fullText || "No response generated.",
                    references: references
                },
                description: "Venice AI Uncensored Interface" + disclaimer
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
    console.log("Requesting response from Venice AI...");
    const result = await VeniceAI.chat("Saha wae pahlawan ti Jawa Barat?");
    console.log(JSON.stringify(result, null, 2));
})();

module.exports = VeniceAI;