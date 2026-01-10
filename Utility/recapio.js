const axios = require('axios');

class RecapioClient {
    constructor(videoUrl) {
        this.videoUrl = videoUrl;
        this.videoId = this.extractVideoId(videoUrl);
        this.fingerprint = Buffer.from(Date.now().toString()).toString('base64');
        this.baseUrl = 'https://api.recapio.com';
        this.headers = {
            authority: 'api.recapio.com',
            'accept-language': 'id-ID,id;q=0.9',
            origin: 'https://recapio.com',
            referer: 'https://recapio.com/',
            'sec-ch-ua': '"Chromium";v="132"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
            'x-app-language': 'en',
            'x-device-fingerprint': this.fingerprint
        };
    }

    extractVideoId(url) {
        const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
        return match ? match[1] : null;
    }

    async initiate() {
        try {
            const response = await axios.post(
                `${this.baseUrl}/youtube-chat/initiate`,
                { url: this.videoUrl },
                { headers: this.headers }
            );
            return response.data;
        } catch (error) {
            throw new Error(`Initiate gagal: ${error.message}`);
        }
    }

    async checkStatus(slug) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/youtube-chat/status/by-slug/${slug}`,
                {
                    params: { fingerprint: this.fingerprint },
                    headers: this.headers
                }
            );

            if (response.data?.transcript) {
                response.data.transcript = JSON.parse(response.data.transcript);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Cek status gagal: ${error.message}`);
        }
    }

    async start() {
        try {
            console.log('Memulai proses...');
            const init = await this.initiate();
            console.log('Init berhasil, slug:', init.slug);

            const status = await this.checkStatus(init.slug);
            console.log('Status diperoleh');

            return {
                info: init,
                slug_ai: status
            };
        } catch (error) {
            throw error;
        }
    }

    async sendMessage(prompt) {
        try {
            console.log('Mengirim prompt:', prompt);

            const response = await axios.post(
                `${this.baseUrl}/youtube-chat/message`,
                {
                    message: prompt,
                    video_id: this.videoId,
                    fingerprint: this.fingerprint
                },
                {
                    headers: {
                        ...this.headers,
                        accept: 'text/event-stream',
                        'content-type': 'application/json'
                    },
                    responseType: 'text'
                }
            );

            let result = '';
            const lines = response.data.split('\n');

            for (const line of lines) {
                if (line.startsWith('data:')) {
                    try {
                        const data = line.slice(5).trim();
                        if (data) {
                            const chunk = JSON.parse(data);
                            result += chunk.chunk || '';
                        }
                    } catch (error) {
                        continue;
                    }
                }
            }

            return result;
        } catch (error) {
            throw new Error(`Kirim pesan gagal: ${error.message}`);
        }
    }

    async getSummary() {
        try {
            const videoData = await this.start();
            console.log('\nInfo video diperoleh');

            const summary = await this.sendMessage(
                'Extract the most important bullet points from this video, organized in a clear, structured format.'
            );

            return {
                videoInfo: videoData.info,
                summary: summary
            };
        } catch (error) {
            throw error;
        }
    }
}

async function main() {
    try {
        const recapio = new RecapioClient('https://youtube.com/watch?v=2y1OxYwvkhY');

        console.log('Mengambil summary video...');
        const result = await recapio.getSummary();

        console.log('\n=== VIDEO INFO ===');
        console.log('Title:', result.videoInfo.title);
        console.log('Duration:', result.videoInfo.duration);
        console.log('Slug:', result.videoInfo.slug);

        console.log('\n=== SUMMARY ===');
        console.log(result.summary);

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

if (require.main === module) {
    main();
}

module.exports = RecapioClient;