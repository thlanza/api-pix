if (process.env.NODE_ENV !== 'production') {
require('dotenv').config()
};


const express = require('express');
const GNRequest = require('./apis/gerencianet');


const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.set('view engine', 'ejs');
app.set('views', 'src/views');

const reqGNAlready = GNRequest({
    clientID: process.env.GN_CLIENT_ID,
    clientSecret: process.env.GN_CLIENT_SECRET
});

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

app.get('/cobrancas', async (req, res) => {
    const reqGN = await reqGNAlready;

    const cobResponse = await reqGN.get('/v2/cob?inicio=2022-02-15T16:01:35Z&fim=2022-04-01T23:59:00Z');

    res.send(cobResponse.data);
});

app.post('/webhook(/pix)?', (req, res) => {
    console.log(req.body);
    res.send('200');
});

app.listen(5000, () => {
    console.log('Api Pix rodando.')
});


