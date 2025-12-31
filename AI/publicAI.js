const axios = require('axios');

/**
 * PublicAI Scraper
 * @author AgungDevX
 */
async function publicai(q) {
   try {
      // pariksa heula inputna bisi kosong
      if (!q) return { author: 'AgungDevX', status: false, msg: 'Mana pertanyaanna anjing?!' };

      const id = (l = 16) => Array.from({ length: l }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('');
      
      const { data } = await axios.post('https://publicai.co/api/chat', {
         tools: {},
         id: id(),
         messages: [{
            id: id(),
            role: 'user',
            parts: [{ type: 'text', text: q }]
         }],
         trigger: 'submit-message'
      }, {
         headers: {
            'Origin': 'https://publicai.co',
            'Referer': 'https://publicai.co/chat',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36'
         }
      });

      // sikat data streamna meh jadi teks bersih
      const res = data.split('\n\n')
         .filter(v => v && !v.includes('[DONE]'))
         .map(v => JSON.parse(v.substring(6)))
         .filter(v => v.type === 'text-delta')
         .map(v => v.delta).join('');

      return {
         author: 'AgungDevX',
         status: true,
         result: res || 'Gagal cok, eweuh respon!'
      };
   } catch (e) {
      // lamun error modar didieu
      return { author: 'AgungDevX', status: false, msg: e.message };
   }
}

// gaskeun tanyakeun
publicai('Saha maneh?').then(v => console.log(JSON.stringify(v, null, 2)));
