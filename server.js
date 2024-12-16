require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();

const API_KEY = process.env.OPENAI_API_KEY;

app.use(bodyParser.json());
app.use(express.static('public')); // Serves the HTML file

const templates = {
    "Sygt Dyr": `1. Identifikation:
- Dato: Mangler information fra Dyrlægen
- Navn: Mangler information fra Dyrlægen
- ID: Mangler information fra Dyrlægen
- Race: Mangler information fra Dyrlægen
- Alder: Mangler information fra Dyrlægen
- Køn: Mangler information fra Dyrlægen
- Neutralisering: Mangler information fra Dyrlægen

2. Præsentation:
Mangler information fra Dyrlægen

3. Henvendelsesårsag:
Mangler information fra Dyrlægen

4. Anamnese:
Mangler information fra Dyrlægen

5. Tidligere relevante sygdomsforløb:
Mangler information fra Dyrlægen

6. Klinisk undersøgelse:
Mangler information fra Dyrlægen

7. Kliniske fund:
Mangler information fra Dyrlægen

8. IPL (Initial Problem Liste):
Mangler information fra Dyrlægen

9. Vurdering:
Mangler information fra Dyrlægen

10. Behandlingsplan:
Mangler information fra Dyrlægen`,

    "Kontrol SOAP": `1. Subjektiv vurdering:
Mangler information fra Dyrlægen

2. Objektiv vurdering:
Mangler information fra Dyrlægen

3. Analyse:
Mangler information fra Dyrlægen

4. Plan:
Mangler information fra Dyrlægen`,

    "Vaccination": `1. Identifikation:
Mangler information fra Dyrlægen

2. Vaccinationstype:
Mangler information fra Dyrlægen

3. Bemærkninger:
Mangler information fra Dyrlægen`,

    "Morgenindtag": `1. Dagens procedurer:
Mangler information fra Dyrlægen

2. Medicinering:
Mangler information fra Dyrlægen

3. Observationer:
Mangler information fra Dyrlægen`
};

app.post('/api/generate', async (req, res) => {
    const { journalType, userInput } = req.body;

    if (!journalType || !userInput) {
        return res.status(400).json({ message: "journalType og userInput er påkrævet." });
    }

    const template = templates[journalType];
    if (!template) {
        return res.status(400).json({ message: "Ugyldig journaltype." });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: `Du er VetPA, en veterinær personlig assistent designet til at hjælpe med professionel journalføring. Brug følgende skabelon: ${template}` },
                    { role: 'user', content: userInput },
                ],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(500).json({ message: data.error.message });
        }

        res.json({ result: data.choices[0].message.content });
    } catch (error) {
        console.error('Fejl under OpenAI API-opkald:', error);
        res.status(500).json({ message: 'Fejl under OpenAI API-opkald.' });
    }
});

app.post('/api/summary', async (req, res) => {
    const { journalContent } = req.body;

    if (!journalContent) {
        return res.status(400).json({ message: "journalContent er påkrævet." });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: "Lav en kort, ejerrettet opsummering af journalen." },
                    { role: 'user', content: journalContent },
                ],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(500).json({ message: data.error.message });
        }

        res.json({ result: data.choices[0].message.content });
    } catch (error) {
        console.error('Fejl under OpenAI API-opkald:', error);
        res.status(500).json({ message: 'Fejl under OpenAI API-opkald.' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${PORT}`);
});
