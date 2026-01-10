const fs = require('fs').promises;
const axios = require('axios');

const API_BASE = 'https://photoenhancer.pro';
const ENHANCE_ENDPOINT = '/api/enhance';
const STATUS_ENDPOINT = '/api/status';

class PhotoEnhancer {
    constructor() {
        this.client = axios.create({
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async readImage(path) {
        const data = await fs.readFile(path, 'base64');
        return `data:image/jpeg;base64,${data}`;
    }

    async enhance(imagePath) {
        try {
            const imageData = await this.readImage(imagePath);
            
            const payload = {
                imageData,
                mode: "fast",
                params: { mode: "fast" },
                fileName: "image.png"
            };

            console.log('Mengirim permintaan enhance...');
            const enhanceRes = await this.client.post(
                `${API_BASE}${ENHANCE_ENDPOINT}`,
                payload
            );

            const predictionId = enhanceRes.data.predictionId;
            console.log(`Prediction ID: ${predictionId}`);

            return await this.waitForResult(predictionId);
            
        } catch (error) {
            throw new Error(`Gagal enhance: ${error.message}`);
        }
    }

    async waitForResult(predictionId, maxAttempts = 30) {
        const params = { id: predictionId };
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            try {
                console.log(`Cek status (${attempt + 1}/${maxAttempts})...`);
                const statusRes = await this.client.get(
                    `${API_BASE}${STATUS_ENDPOINT}`,
                    { params }
                );

                const { status, resultUrl } = statusRes.data;
                
                if (status === 'succeeded' && resultUrl) {
                    console.log('Enhance selesai!');
                    return resultUrl;
                }
                
                if (status === 'failed') {
                    throw new Error('Proses enhance gagal');
                }
                
            } catch (error) {
                if (attempt === maxAttempts - 1) {
                    throw new Error(`Timeout: ${error.message}`);
                }
            }
        }
        
        throw new Error('Timeout menunggu hasil');
    }

    async downloadResult(url, savePath) {
        try {
            console.log('Mengunduh hasil...');
            const response = await this.client.get(url, {
                responseType: 'arraybuffer'
            });
            
            await fs.writeFile(savePath, Buffer.from(response.data));
            console.log(`Hasil disimpan di: ${savePath}`);
            
        } catch (error) {
            throw new Error(`Gagal mengunduh: ${error.message}`);
        }
    }
}

async function main() {
    const enhancer = new PhotoEnhancer();
    
    const inputPath = './gambar.jpg';
    const outputPath = '/sdcard/Download/result.jpg';

    try {
        await fs.access(inputPath);
        
        const resultUrl = await enhancer.enhance(inputPath);
        await enhancer.downloadResult(resultUrl, outputPath);
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = PhotoEnhancer;