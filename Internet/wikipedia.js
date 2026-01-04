const axios = require('axios');

async function simpleWikiScrape(searchTerm) {
    console.log(`🔍 Cari: ${searchTerm}`);
    
    // User Agent yang work
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json'
    };
    
    try {
        // 1. Cari dulu
        const searchRes = await axios.get(
            'https://id.wikipedia.org/w/api.php',
            {
                params: {
                    action: 'query',
                    list: 'search',
                    srsearch: searchTerm,
                    format: 'json',
                    srlimit: 3
                },
                headers
            }
        );
        
        const results = searchRes.data.query.search;
        if (!results || results.length === 0) {
            return { error: 'Tidak ditemukan' };
        }
        
        const pageTitle = results[0].title;
        
        // 2. Ambil ringkasan saja (lebih mudah)
        const pageRes = await axios.get(
            'https://id.wikipedia.org/w/api.php',
            {
                params: {
                    action: 'query',
                    titles: pageTitle,
                    prop: 'extracts|info',
                    exintro: 1,
                    explaintext: 1,
                    inprop: 'url',
                    format: 'json'
                },
                headers
            }
        );
        
        const pages = pageRes.data.query.pages;
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
        
        // 3. Hasil sederhana
        return {
            status: 'success',
            title: page.title,
            url: page.fullurl,
            summary: page.extract,
            search_results: results.map(r => ({
                title: r.title,
                snippet: r.snippet
            }))
        };
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        
        // Fallback: Gunakan Wikipedia mobile
        try {
            const mobileRes = await axios.get(
                `https://id.m.wikipedia.org/wiki/${encodeURIComponent(searchTerm)}`,
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Mobile Safari/537.36'
                    }
                }
            );
            
            return {
                status: 'mobile_fallback',
                title: searchTerm,
                url: `https://id.m.wikipedia.org/wiki/${encodeURIComponent(searchTerm)}`,
                note: 'Diambil dari versi mobile'
            };
            
        } catch (mobileError) {
            return {
                status: 'error',
                error: mobileError.message
            };
        }
    }
}

// Jalankan
const search = process.argv[2] || 'Jokowi';
simpleWikiScrape(search).then(result => {
    console.log(JSON.stringify(result, null, 2));
});