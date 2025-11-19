const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// <-- Wichtig: Body Parser aktivieren
app.use(bodyParser.json());

function vorhersage(input) {
    // Beispiel: nur zurückgeben, was reinkommt
    return `Server hat empfangen: ${input}`;
}

app.post('/predict', (req, res) => {
    console.log("Anfrage vom Client erhalten:", req.body);

    const input = req.body.input; // <-- hier kam vorher undefined
    const output = vorhersage(input);

    res.json({ result: output });
});

app.listen(3000, '0.0.0.0', () => {
    console.log('Server läuft auf http://192.168.178.39:3000');
});

