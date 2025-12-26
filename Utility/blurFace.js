const axios = require('axios');
const FormData = require('form-data');
const sizeOf = require('image-size');

class BlurFace {
    constructor() {
        this.baseHeaders = {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
            "Origin": "https://www.iloveimg.com",
            "Referer": "https://www.iloveimg.com/blur-face"
        };
    }

    async init() {
        try {
            const { data: html } = await axios.get("https://www.iloveimg.com/blur-face", { headers: this.baseHeaders });
            
            const token = html.match(/(ey[a-zA-Z0-9?%-_/]+)/g)?.[1];
            const configMatch = html.match(/var ilovepdfConfig = ({.*?});/s);
            const config = configMatch ? JSON.parse(configMatch[1]) : {};
            const taskId = html.match(/ilovepdfConfig\.taskId\s*=\s*['"](\w+)['"]/)?.[1];
            const server = config.servers?.[Math.floor(Math.random() * config.servers.length)];

            if (!token || !taskId || !server) throw new Error("INITIALIZATION_FAILED");

            this.token = token;
            this.taskId = taskId;
            this.serverBase = `https://${server}.iloveimg.com`;
            this.api = axios.create({
                baseURL: this.serverBase,
                headers: { ...this.baseHeaders, "Authorization": `Bearer ${token}` }
            });
        } catch (e) {
            throw new Error("Failed to initialize session: " + e.message);
        }
    }

    async execute(imageUrl) {
        try {
            await this.init();

            const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(imgRes.data);
            
            // Perbaikan pemanggilan image-size
            const dimensions = sizeOf.imageSize ? sizeOf.imageSize(buffer) : sizeOf(buffer);
            const ext = dimensions.type || 'png';
            const fileName = `image.${ext}`;

            const uploadForm = new FormData();
            uploadForm.append("name", fileName);
            uploadForm.append("chunk", "0");
            uploadForm.append("chunks", "1");
            uploadForm.append("task", this.taskId);
            uploadForm.append("preview", "1");
            uploadForm.append("v", "web.0");
            uploadForm.append("file", buffer, { filename: fileName, contentType: `image/${ext}` });

            const { data: uploadData } = await this.api.post("/v1/upload", uploadForm, { 
                headers: uploadForm.getHeaders() 
            });
            
            const serverFilename = uploadData.server_filename;

            // Face Detection
            const detectForm = new FormData();
            detectForm.append("task", this.taskId);
            detectForm.append("level", "recommended");
            detectForm.append("fileArray[0][server_filename]", serverFilename);
            await this.api.post("/v1/detectfaces", detectForm, { headers: detectForm.getHeaders() });

            // Process
            const processForm = new FormData();
            processForm.append("packaged_filename", "blurred_result");
            processForm.append("width", dimensions.width);
            processForm.append("height", dimensions.height);
            processForm.append("level", "recommended");
            processForm.append("mode", "include");
            processForm.append("task", this.taskId);
            processForm.append("tool", "blurfaceimage");
            processForm.append("files[0][server_filename]", serverFilename);
            processForm.append("files[0][filename]", fileName);
            await this.api.post("/v1/process", processForm, { headers: processForm.getHeaders() });

            return {
                status: 200,
                success: true,
                payload: {
                    task_id: this.taskId,
                    original_url: imageUrl,
                    format: ext,
                    resolution: { w: dimensions.width, h: dimensions.height },
                    download_url: `${this.serverBase}/v1/download/${this.taskId}`
                }
            };

        } catch (err) {
            return { status: 500, success: false, message: err.message };
        }
    }
}

// --- TEST ---
(async () => {
    const worker = new BlurFace();
    const result = await worker.execute('https://files.catbox.moe/zr6jpz.png');
    console.log(JSON.stringify(result, null, 2));
})();