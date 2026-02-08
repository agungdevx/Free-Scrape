const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeZenFinal() {
    try {
        const url = "https://id.wikipedia.org/wiki/Daftar_hari_penting_di_Indonesia";
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const $ = cheerio.load(data);
        const hasil = [];

        // Dumasar HTML nu dikirim, data aya dina jero <li> sanggeus <h3> (Bulan)
        // Urang sikat kabeh list nu aya dina mw-parser-output
        $('.mw-parser-output ul li').each((i, el) => {
            const text = $(el).text().trim();
            
            // Logika misahkeun Tanggal jeung Kajadian (biasana dipisah ku titik dua ':')
            if (text.includes(':')) {
                const parts = text.split(':');
                const tanggal = parts[0].trim();
                const event = parts[1].trim();

                // Ngabersihan sitasi rungsing jiga [1] atawa [2]
                const cleanText = (t) => t.replace(/\[\d+\]/g, '').trim();

                // Filter ameh nu asup ngan data poe penting hungkul (aya angka tanggalan)
                if (/\d/.test(tanggal) && tanggal.length < 30) {
                    hasil.push({
                        tanggal: cleanText(tanggal),
                        event: cleanText(event)
                    });
                }
            }
        });

        return {
            status: true,
            creator: "AgungDevX",
            total_data: hasil.length,
            result: hasil
        };

    } catch (err) {
        return { status: false, msg: err.message };
    }
}

// Jalankeun lur!
scrapeZenFinal().then(res => {
    console.log(JSON.stringify(res, null, 2));
});

/**
*** Hasil Json'
***
{
  "status": true,
  "creator": "AgungDevX",
  "total_data": 446,
  "result": [
    {
      "tanggal": "1 Januari",
      "event": "Tahun baru Masehi"
    },
    {
      "tanggal": "27 Rajab",
      "event": "Isra dan Mikraj Nabi Muhammad SAW (Islam)"
    },
    {
      "tanggal": "1 Mei",
      "event": "Hari Buruh Internasional"
    },
    {
      "tanggal": "1 Juni",
      "event": "Hari Lahir Pancasila"
    },
    {
      "tanggal": "1 – 2 Syawal",
      "event": "Hari Raya Idul Fitri (Islam)"
    },
...
**/