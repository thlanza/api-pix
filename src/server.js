if (process.env.NODE_ENV !== 'production') {
require('dotenv').config()
};


const express = require('express');
const GNRequest = require('./apis/gerencianet');


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'src/views');

const reqGNAlready = GNRequest();

app.get('/', async (req, res) => {

        const reqGN = await reqGNAlready;
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


