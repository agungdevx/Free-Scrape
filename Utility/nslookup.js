const axios = require('axios');

async function nslookupDomain(domain) {
    const url = 'https://www.nslookup.io/api/v1/webservers';
    
    const requestData = {
        domain: domain
    };

    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
        'Referer': `https://www.nslookup.io/domains/${domain}/webservers/`
    };

    try {
        const response = await axios.post(url, requestData, { headers });
        
        return {
            success: true,
            data: response.data,
            author: "AgungDevX"
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            author: "AgungDevX"
        };
    }
}

nslookupDomain("google.com")
    .then(result => console.log(JSON.stringify(result, null, 2)))
    .catch(console.error);