const axios = require('axios');

/**
 * Wasted Canvas Sticker Scraper
 * Base: https://some-random-api.com/canvas/wasted
 * Author: Modified by Agung
 */
const WastedCanvas = {
    /**
     * @param {String} avatarUrl - Link foto profil target
     */
    generate: async (avatarUrl) => {
        try {
            if (!avatarUrl) return { status: 400, success: false, message: "Avatar URL is required." };

            // Endpoint pikeun ngolah gambar jadi efek wasted
            const resultUrl = `https://some-random-api.com/canvas/wasted?avatar=${encodeURIComponent(avatarUrl)}`;
            
            // Verifikasi naha linkna jalan atanapi henteu
            const check = await axios.head(resultUrl);
            if (check.status !== 200) throw new Error("Failed to reach API server.");

            const disclaimer = "\n\n---\nEducational Purpose Only\nScript ini dibagikan untuk tujuan riset pengembangan bot, edukasi manipulasi gambar (Canvas API), dan pengembangan perangkat lunak.";

            return {
                status: 200,
                success: true,
                payload: {
                    title: "Wasted Canvas Effect",
                    method: "GET",
                    result_url: resultUrl,
                    note: "Use this URL to send as a sticker or image."
                },
                description: "Canvas Image Processing Service" + disclaimer
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
    console.log("Generating Wasted effect URL...");
    // Ganti URL avatar di handap keur ngetes
    const testAvatar = "https://files.catbox.moe/6x69ri.jpg";
    const result = await WastedCanvas.generate(testAvatar);
    console.log(JSON.stringify(result, null, 2));
})();

module.exports = WastedCanvas;