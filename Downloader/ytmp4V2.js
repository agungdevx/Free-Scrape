const axios = require('axios');

async function downloadYouTubeVideo(videoId, quality = '360P') {
    const apiUrl = 'https://api.vidssave.com/api/contentsite_api/media/parse';
    
    const params = new URLSearchParams({
        auth: '20250901majwlqo',
        domain: 'api-ak.vidssave.com',
        origin: 'source',
        link: `https://youtube.com/watch?v=${videoId}`
    });

    try {
        const response = await axios.post(apiUrl, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data.status === 1) {
            const resources = response.data.data.resources;
            const selected = resources.find(r => r.quality === quality);
            
            if (selected && selected.download_url) {
                return {
                    success: true,
                    title: response.data.data.title,
                    downloadUrl: selected.download_url,
                    quality: selected.quality,
                    size: selected.size
                };
            }
        }
        
        return { success: false, message: response.data.msg || 'No download link found' };
        
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// Usage
downloadYouTubeVideo('rB4kIky6yK8', '360P')
    .then(result => console.log(result));