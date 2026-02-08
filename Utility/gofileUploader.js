const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data'); // Install: npm install form-data

/**
 * UPLOADER GOFILE 2026
 * Ngajadikeun file lokal jadi link Gofile
 */
async function uploadKaGofile(filePath) {
    try {
        console.log(">> 1. Neangan server nu kosong...");
        const serverRes = await axios.get('https://api.gofile.io/servers');
        
        if (serverRes.data.status !== "ok") throw new Error("Gagal meunangkeun server!");
        const server = serverRes.data.data.servers[0].name; // Paké server munggaran nu sadia
        console.log(`>> Paké server: ${server}`);

        console.log(">> 2. Keur ngupload file...");
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        const uploadUrl = `https://${server}.gofile.io/contents/uploadfile`;
        const res = await axios.post(uploadUrl, form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
            }
        });

        if (res.data.status === "ok") {
            console.log(">> JOS! File geus jadi link:");
            console.log(JSON.stringify(res.data.data, null, 2));
            return res.data.data;
        } else {
            console.log(">> Gagal upload euy: " + res.data.status);
        }

    } catch (err) {
        console.log(">> Masalah: " + err.message);
    }
}

// Jalankeun, pastikeun aya file ./gambar.jpg dina folder nu sarua
uploadKaGofile('./gambar.jpg');

/**
*** Hasil Json'
***
>> 1. Neangan server nu kosong...
>> Paké server: store-na-phx-4
>> 2. Keur ngupload file...
>> JOS! File geus jadi link:
{
  "createTime": 1770556620,
  "downloadPage": "https://gofile.io/d/rXmyik",
  "guestToken": "mMgKYe35F59gOMIBQTrr2lvjlsT375m2",
  "id": "089eccde-7055-46ef-8e48-9a94c9435950",
  "md5": "48bbada3dc5dafa874cefd53e5993415",
  "mimetype": "image/jpeg",
  "modTime": 1770556620,
  "name": "gambar.jpg",
  "parentFolder": "5889427f-372d-4f03-a92c-5898c74727d0",
  "parentFolderCode": "rXmyik",
  "servers": [
    "store-na-phx-4"
  ],
  "size": 62077,
  "type": "file"
}
**/