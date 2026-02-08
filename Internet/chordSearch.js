const axios = require('axios');
const cheerio = require('cheerio');

/**
 * CHORD GITAR SCRAPER (GITAGRAM)
 * @creator AgungDevX
 */
class Chords {
    constructor(music) {
        this.searchUri = `https://www.gitagram.com/index.php?cat=&s=${encodeURIComponent(music)}`;
    }

    // Pilari daptar lagu/chord
    async getSearch() {
        try {
            const { data } = await axios.get(this.searchUri, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
                }
            });
            const $ = cheerio.load(data);
            let results = [];

            $("table.table tbody tr").each((index, element) => {
                let title = $(element).find("span.title.is-6").text().trim();
                let artist = $(element).find("span.subtitle.is-6").text().replace("‣", "").trim();
                let link = $(element).find("a").attr("href");
                let type = $(element).find("span.title.is-7").text().trim();

                if (title) {
                    results.push({
                        title,
                        artist,
                        link: link.startsWith('http') ? link : `https://www.gitagram.com${link}`,
                        type
                    });
                }
            });

            return { status: true, creator: "AgungDevX", result: results };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }

    // Nyokot detail lirik & chord
    async getDetail(uri) {
        try {
            const { data } = await axios.get(uri, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36'
                }
            });
            const $ = cheerio.load(data);

            let title = $("h1.title.is-5").text().trim();
            let artist = $("div.subheader a span.subtitle").text().replace("‣", "").trim();
            let artistProfileLink = $("div.subheader a").attr("href");
            let artistImage = $("figure.image img").attr("src");
            
            // Nyokot eusi chord dina tag <pre>
            let rawChords = "";
            $("div.content pre").each((index, element) => {
                rawChords += $(element).text() + "\n";
            });

            return {
                status: true,
                creator: "AgungDevX",
                result: {
                    title,
                    artist,
                    artistProfileLink: artistProfileLink ? `https://www.gitagram.com${artistProfileLink}` : null,
                    artistImage: artistImage || null,
                    chords: rawChords.trim()
                }
            };
        } catch (error) {
            return { status: false, message: error.message };
        }
    }
}

// --- TESTER DI TERMUX ---
async function test() {
    const chord = new Chords("Last Child Duka");
    const search = await chord.getSearch();
    
    if (search.status && search.result.length > 0) {
        console.log("[-] Hasil Pilarian:");
        console.log(JSON.stringify(search, null, 2));

        console.log("\n[-] Nyokot Detail Link Kahiji...");
        const detail = await chord.getDetail(search.result[0].link);
        console.log(JSON.stringify(detail, null, 2));
    }
}

test();

module.exports = Chords;

/** 
*** Hasil Json' 
***
[-] Hasil Pilarian:
{
  "status": true,
  "creator": "AgungDevX",
  "result": [
    {
      "title": "Duka",
      "artist": "Last Child",
      "link": "https://www.gitagram.com/chords/duka-last-child/",
      "type": "Chords"
    }
  ]
}

[-] Nyokot Detail Link Kahiji...
{
  "status": true,
  "creator": "AgungDevX",
  "result": {
    "title": "Duka Chords",
    "artist": "Last Child",
    "artistProfileLink": "https://www.gitagram.com/artist/last-child/",
    "artistImage": "https://www.gitagram.com/img/artist/last-child.jpg",
    "chords": "Last Child – Duka\n \n \n \n[Intro]\nF\nC  G  Am  F G\n \n[Verse]\n       F         G          Am\nkau membunuhku dengan kepedihan ini\n       F           G          Am\nkau hempaskanku ke dalam retaknya hati\n       F        G               Em         Am\nhingga air mata tak mampu tuk melukiskan perih\n         F              G\nyang kau ukir dalam.. hati ini..\n \n       F          G          Am\nkau hancurkan diriku saat engkau pergi\n    F            G          Am\nsetelah kau patahkan sayap ini..\n       F           G         Em            Am\nhingga ku takkan bisa tuk terbang tinggi lagi\n       F                       G\ndan mencari bintang yang dapat menggantikanmu\n \n[Chorus]\n            C\nsampai kini masih ku coba\n            G\ntuk terjaga dari mimpi ku..\n             Am\nyang buat ku tak sadar bahwa kau bukan\nF         G\nlagi milikku..\n \n           C\nwalau hati tak akan pernah\n          G\ndapat melupakan dirimu\n               Am\ndan tiap tetes air mata yang jatuh\n  F          G\nkuatkan rinduku..\n \n     Em      Am      Em      Am\npada indah bayangmu, canda tawamu\n       F                 G          C\npada indahnya duka dalam kenangan kita..\n \n[Intro]\nC  G  Am  F G\n \n[Verse]\n       F          G          Am\nkau hancurkan diriku saat engkau pergi\n    F            G          Am\nsetelah kau patahkan sayap ini..\n       F           G         Em            Am\nhingga ku takkan bisa tuk terbang tinggi lagi\n       F                       G\ndan mencari bintang yang dapat menggantikanmu\n \n[Chorus]\n            C\nsampai kini masih ku coba\n            G\ntuk terjaga dari mimpi ku..\n             Am\nyang buat ku tak sadar bahwa kau bukan\nF         G\nlagi milikku..\n \n           C\nwalau hati tak akan pernah\n          G\ndapat melupakan dirimu\n               Am\ndan tiap tetes air mata yang jatuh\n  F          G\nkuatkan rinduku..\n \n     Em      Am      Em      Am\npada indah bayangmu, canda tawamu\n       F                 G          Am\npada indahnya duka dalam kenangan kita..\n \n(Interlude)\nAm F C G\nAm F C G\nAm F C G\nAm F C G A\n \n[Chorus] (Overtone)\n            D\nsampai kini masih ku coba\n            A\ntuk terjaga dari mimpi ku..\n            Bm\nyang buatku tak sadar bahwa kau bukan\nG         A\nlagi milikku..\n \n           D\nwalau hati tak akan pernah\n          A\ndapat melupakan dirimu\n               Bm\ndan tiap tetes air mata yang jatuh\n  G          A\nkuatkan rinduku\n \n     F#m     Bm      F#m     Bm\npada indah bayangmu, canda tawamu\n       G                 A\npada indahnya duka dalam kenangan kita..\n \nD       A   Bm      G A\nho.. oo o.. ho.. oo o..\nD       A   Bm      G A G\nho.. oo o.. ho.. oo o.."
  }
}
**/