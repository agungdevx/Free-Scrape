const axios = require('axios');
const fs = require('fs');

/**
 * Carbonara Code-to-Image Scraper
 * Engine: Carbonara (High Quality)
 * Owners: AgungDevX
 */
const Carbon = {
    config: {
        api: 'https://carbonara.solopov.dev/api/cook',
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    },

    /**
     * @param {Object} options
     * @param {String} options.code - Script nu rek dijadikeun gambar
     * @param {String} options.theme - Tema (seti, monokai, dracula, material)
     * @param {String} options.lang - Basa (javascript, python, php, jsb)
     */
    generate: async ({ code, theme = 'seti', lang = 'javascript' }) => {
        try {
            if (!code) return { status: 400, success: false, owners: "AgungDevX", message: "Missing code input." };

            const payload = {
                code: code,
                language: lang,
                theme: theme,
                backgroundColor: "#1F2937",
                dropShadow: true,
                windowControls: true,
                widthAdjustment: true,
                lineNumbers: true,
                paddingVertical: "48px",
                paddingHorizontal: "48px"
            };

            const { data } = await axios.post(Carbon.config.api, payload, {
                headers: { 
                    'Content-Type': 'application/json',
                    'User-Agent': Carbon.config.ua
                },
                responseType: 'arraybuffer'
            });

            const disclaimer = "\n\n---\nEducational Purpose Only\nScript ini dikembangkan oleh AgungDevX untuk riset otomasi dokumentasi kode dan edukasi sistem pengolahan gambar digital.";

            return {
                status: 200,
                success: true,
                owners: "AgungDevX",
                payload: {
                    mimetype: "image/png",
                    buffer: Buffer.from(data), // Ieu hasilna Buffer utuh
                    info: {
                        theme: theme,
                        language: lang,
                        size: data.length
                    }
                },
                description: "Professional Code to Carbon Image Service" + disclaimer
            };

        } catch (err) {
            return {
                status: 500,
                success: false,
                owners: "AgungDevX",
                message: err.message
            };
        }
    }
};

/**
 * TEST RUN (LANGSUNG JADI FILE)
 */
(async () => {
    const codeExample = `// Scraper by AgungDevX\nconst data = {\n  status: 200,\n  owners: "AgungDevX",\n  type: "Professional"\n};`;

    const result = await Carbon.generate({ 
        code: codeExample, 
        theme: 'dracula' 
    });

    if (result.success) {
        // Nyimpen buffer jadi file nyata
        fs.writeFileSync('carbon_result.png', result.payload.buffer);
        
        console.log("========================================");
        console.log("STATUS  : " + result.status);
        console.log("OWNERS  : " + result.owners);
        console.log("FILE    : carbon_result.png (Saved)");
        console.log("========================================");
    } else {
        console.log(result);
    }
})();

module.exports = Carbon;

// Resultna Buffer Ya Sayang