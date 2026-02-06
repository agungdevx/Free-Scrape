const axios = require("axios");
const CryptoJS = require("crypto-js");

/**
 * MEGA.NZ Professional Scraper
 * @creator @ShiroNexo
 */
const mega = {
    // Fungsi dekripsi atribut (ngaran file)
    decryptAttr: (enc, fileKey) => {
        try {
            const ab = (s) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), 'base64');
            const kResult = ab(fileKey);
            const k = new Uint32Array(kResult.buffer);
            const key = new Uint8Array(new Uint32Array([k[0] ^ k[4], k[1] ^ k[5], k[2] ^ k[6], k[3] ^ k[7]]).buffer);

            const decrypted = CryptoJS.AES.decrypt(
                { ciphertext: CryptoJS.lib.WordArray.create(ab(enc)) },
                CryptoJS.lib.WordArray.create(key),
                { iv: CryptoJS.lib.WordArray.create(new Uint8Array(16)), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.NoPadding }
            );

            const str = CryptoJS.enc.Utf8.stringify(decrypted).replace(/\0/g, "").trim();
            return JSON.parse(str.substring(4));
        } catch (e) { return { n: "[Decryption Error]" }; }
    },

    fetch: async (url) => {
        try {
            const fileId = url.match(/file\/([a-zA-Z0-9_-]+)/)?.[1];
            const fileKey = url.split('#')[1];

            if (!fileId || !fileKey) throw new Error("URL Mega teu valid (ID atawa Key euweuh)");

            const { data } = await axios.post("https://g.api.mega.co.nz/cs", [{ a: "g", g: 1, p: fileId }], {
                headers: { "user-agent": "Postify/1.0.0" },
                timeout: 15000
            });

            if (typeof data[0] === 'number') throw new Error(`Mega Error: ${data[0]}`);

            const info = data[0];
            const attr = mega.decryptAttr(info.at, fileKey);

            return {
                status: true,
                creator: "@ShiroNexo",
                data: {
                    filename: attr.n,
                    size: info.s,
                    size_formatted: (info.s / (1024 * 1024)).toFixed(2) + " MB",
                    download_url: info.g
                }
            };
        } catch (err) {
            return { status: false, creator: "@ShiroNexo", message: err.message };
        }
    }
};

// --- TESTER ---
const testerUrl = "https://mega.nz/file/ovJTHaQZ#yAbkrvQgykcH_NDKQ8eIc0zvsN7jonBbHZ_HTQL6lZ8";

if (testerUrl.includes("#")) {
    mega.fetch(testerUrl).then(res => console.log(JSON.stringify(res, null, 2)));
} else {
    console.log(JSON.stringify({ status: false, message: "Masukeun link Mega nu lengkep jeung #key-na!" }, null, 2));
}

// Hasil Json'
/**
{
  "status": true,
  "creator": "@ShiroNexo",
  "data": {
    "filename": "[Decryption Error]",
    "size": 16577997,
    "size_formatted": "15.81 MB",
    "download_url": "http://gfs208n120.userstorage.mega.co.nz/dl/bwEl-5OpmuD4CQJCgRLe7qRy9FHDq24itCbR840wtInWuga5lLyTiKvT9SV7dXL4AQE8ITvKPdbBdYE9AZzFfrzgx2RgDskSzjzMOHC5LBsEuoI-uuy99PYyB8OmCENsEwcyH4uTogO_bA3edFOLBWC5HZv7I6ZfloBr8a5DNTEYmdLLyL3ts5qwXS1tIkfGLCVbXZFQZ2s2IUytYfzTFEKiESf8Ku5g3k-ILhZaoNP_ZzewTm7wkLpE1w"
  }
}
**/