const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

/**
 * VISUAL PARADIGM PHOTO UNBLUR
 * Taktik: Direct POST -> Stream Buffer -> Save File
 */
async function unblurVisualParadigm(inputPath) {
    const API_URL = "https://ai-services.visual-paradigm.com/api/deblur/file";
    const outputPath = "/sdcard/Download/result.jpg";

    try {
        console.log(">> Ngirim gambar ka AI Visual Paradigm...");

        const form = new FormData();
        // Fieldna kudu 'file' dumasar kana error 'field required' tadi
        form.append('file', fs.createReadStream(inputPath));

        const res = await axios.post(API_URL, form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
                'Referer': 'https://online.visual-paradigm.com/'
            },
            responseType: 'arraybuffer' // Sabab responna mangrupa gambar langsung
        });

        // Simpen hasilna ka folder Download
        fs.writeFileSync(outputPath, res.data);

        const finalResult = {
            status: true,
            author: "AgungDevX",
            msg: "Gambar hasil unblur geus disimpen!",
            saved_to: outputPath,
            size: (res.data.length / 1024).toFixed(2) + " KB"
        };

        return finalResult;

    } catch (err) {
        // Mun aya error JSON dina arraybuffer, urang konversi heula
        let errorMsg = err.message;
        if (err.response && err.response.data) {
            const decode = Buffer.from(err.response.data).toString();
            errorMsg = decode;
        }

        return {
            status: false,
            msg: "Gagal nembus AI Visual Paradigm!",
            error: errorMsg
        };
    }
}

// Gaskeun Lur!
unblurVisualParadigm('./gambar.jpg').then(res => {
    console.log(JSON.stringify(res, null, 2));
});

/**
*** result buffer 
***
>> Ngirim gambar ka AI Visual Paradigm...
{
  "status": true,
  "author": "AgungDevX",
  "msg": "Gambar hasil unblur geus disimpen!",
  "saved_to": "/sdcard/Download/result.jpg",
  "size": "75.83 KB"
}
**/