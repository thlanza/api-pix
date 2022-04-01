if (process.env.NODE_ENV !== 'production') {
require('dotenv').config()
};

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');
const express = require('express');

const cert = fs.readFileSync(
    path.resolve(__dirname, `../certs/${process.env.GN_CERT}`)
);

const agent = new https.Agent({
    pfx: cert,
    passphrase: ''
});

const credentials = Buffer.from(
`${process.env.GN_CLIENT_ID}:${process.env.GN_CLIENT_SECRET}`
).toString('base64');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.get('/', async (req, res) => {

    const authResponse = await axios({
        method: 'POST',
        url: `${process.env.GN_ENDPOINT}/oauth/token`,
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/json'
        },
        httpsAgent: agent,
        data: {
            grant_type: 'client_credentials'
        }
    });
       const accessToken = authResponse.data?.access_token;
    
        const reqGN = axios.create({
            baseURL: process.env.GN_ENDPOINT,
            httpsAgent: agent,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
    
        const dataCob = {
            calendario: {
                "expiracao": 3600
            },
            valor: {
                "original": "100.00"
            },
            chave: "099.407.576-62",
            solicitacaoPagador: "Cobrança"
        };
    
        const cobResponse = await reqGN.post('/v2/cob', dataCob);


        const qrcodeResponse = await reqGN.get(`/v2/loc/${cobResponse.data.loc.id}/qrcode`);
        res.render('qrcode', { qrcodeImage: qrcodeResponse.data.imagemQrcode })
});

app.listen(5000, () => {
    console.log('Api Pix rodando.')
});


