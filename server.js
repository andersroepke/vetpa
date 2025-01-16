require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Tilføjet CORS for at tillade cross-origin requests
const fetch = require('node-fetch');
const app = express();

const API_KEY = process.env.OPENAI_API_KEY;

app.use(cors()); // Aktiver CORS
app.use(bodyParser.json());
app.use(express.static('public')); // Serves the HTML file

const templates = {
    "Sygt Dyr": `1. Signalement:
- Dato: Mangler information fra Dyrlægen
- Navn: Mangler information fra Dyrlægen
- ID: Mangler information fra Dyrlægen
- Race: Mangler information fra Dyrlægen
- Alder: Mangler information fra Dyrlægen
- Køn: Mangler information fra Dyrlægen
- Neutralisering: Mangler information fra Dyrlægen
- Vægt: Mangler information fra Dyrlægen

2. Henvendelsesårsag:
Mangler information fra Dyrlægen

3. Anamnese:
Mangler information fra Dyrlægen

4. Tidligere relevante sygdomsforløb:
Mangler information fra Dyrlægen

5. Klinisk undersøgelse:
- Almentilstand: (BAR/QAR/NR)
- Cirkulatorisk: Slimhinder oralt er lyserøde og fugtige. Crt > 2 sek. 
- Auskultation cor: To klare veladskilte hjertetoner, uden tegn på mislyd.
- Pulsrate: Mangler information fra Dyrlægen
- Auskultation pulmones: Normal vesiculær respiration bilateralt i hele lungefeltet
- Respirationstype: thoracoabdominal respiration
- Lymfeknuder: Palperbare lymfeknuder iab. 
- Abdomen: blød og indolent, uden tegn på patologiske udfyldninger
- Tænder og tandkød: iab
- Ører: iab
- Øjne: iab
- Bevægeapparat: iab
- Mammae/testes: iab
- BCS: _/9
- Temperatur: Mangler information fra Dyrlægen
- Hydreringsstatus: Mangler information fra Dyrlægen

6. IPL (Initial Problem Liste):
IPL: Mangler information fra Dyrlægen

7. Vurdering:
AD: Mangler information fra Dyrlægen

8. Differentialdiagnoser:
Mangler information fra Dyrlægen

9. Diagnostiske tests inkl. fund :
- Blodprøver: Mangler information fra Dyrlægen
- Billeddiagnostik: Mangler information fra Dyrlægen
- Urinanalyse: ingen information
- Afføringsprøver: ingen information
- Indsendte prøver: ingen information om bar-code

10. Vurdering af resultater og fund:
Mangler information fra Dyrlægen

11. Opdateret problemliste:
Mangler information fra Dyrlægen

12. Behandlingsplan/Procedurer:
Mangler information fra Dyrlægen

13. Terapi:
- Forbrugt: Mangler information fra Dyrlægen
- Udleveret: Mangler information fra Dyrlægen

14. Behandlingsplan/Procedurer:
Mangler information fra Dyrlægen

15. Plan til evt. videre forløb:
Mangler information fra Dyrlægen

16. Ejervejledning:
Mangler information fra Dyrlægen`,

    "Kontrol SOAP": `1. Signalement:
- Dato: Mangler information fra Dyrlægen
- Navn: Mangler information fra Dyrlægen
- ID: Mangler information fra Dyrlægen
- Race: Mangler information fra Dyrlægen
- Alder: Mangler information fra Dyrlægen
- Køn: Mangler information fra Dyrlægen
- Neutralisering: Mangler information fra Dyrlægen
- Vægt: Mangler information fra Dyrlægen
    
2. Henvendelsesårsag:
Mangler information fra Dyrlægen

3. Subjektivt:
Mangler information fra Dyrlægen

3. Objektivitet:
Mangler information fra Dyrlægen

4. Vurdering:
Mangler information fra Dyrlægen

5. Plan til evt. videre forløb:
Mangler information fra Dyrlægen

6. Ejervejledning:
Mangler information fra Dyrlægen`,

    "Vaccination/Sundhedstjek": `1. Signalement:
- Dato: Mangler information fra Dyrlægen
- Navn: Mangler information fra Dyrlægen
- ID: Mangler information fra Dyrlægen
- Race: Mangler information fra Dyrlægen
- Alder: Mangler information fra Dyrlægen
- Køn: Mangler information fra Dyrlægen
- Neutralisering: Mangler information fra Dyrlægen
- Vægt: Mangler information fra Dyrlægen

2. Henvendelsesårsag:
Mangler information fra Dyrlægen

3. Anamnese:
Mangler information fra Dyrlægen

4. Tidligere relevante sygdomsforløb:
Mangler information fra Dyrlægen

5. Klinisk undersøgelse:
- Almentilstand: (BAR/QAR/NR)
- Cirkulatorisk: Slimhinder oralt er lyserøde og fugtige. Crt > 2 sek. 
- Auskultation cor: To klare veladskilte hjertetoner, uden tegn på mislyd.
- Auskultation pulmones: Normal vesiculær respiration bilateralt i hele lungefeltet
- Respirationstype: thoracoabdominal respiration
- Lymfeknuder: Palperbare lymfeknuder iab. 
- Abdomen: blød og indolent, uden tegn på patologiske udfyldninger
- Tænder og tandkød: iab
- Ører: iab
- Øjne: iab
- Bevægeapparat: iab
- Mammae/testes: iab
- BCS: _/9

6. IPL (Initial Problem Liste):
IPL: Mangler information fra Dyrlægen

7. Vurdering:
AD: Mangler information fra Dyrlægen

8. Terapi:
- Forbrugt: Mangler information fra Dyrlægen
- Udleveret: Mangler information fra Dyrlægen

9. Plan til evt. videre forløb:
Mangler information fra Dyrlægen

10. Ejervejledning:
Mangler information fra Dyrlægen`,

    "Morgenindtag": `1. Signalement:
- Dato: Mangler information fra Dyrlægen
- Navn: Mangler information fra Dyrlægen
- ID: Mangler information fra Dyrlægen
- Race: Mangler information fra Dyrlægen
- Alder: Mangler information fra Dyrlægen
- Køn: Mangler information fra Dyrlægen
- Neutralisering: Mangler information fra Dyrlægen
- Vægt: Mangler information fra Dyrlægen

2. Henvendelsesårsag:
Mangler information fra Dyrlægen

3. Tidligere relevante sygdomsforløb:
Mangler information fra Dyrlægen

4. Klinisk undersøgelse:
- Almentilstand: (BAR/QAR/NR)
- Cirkulatorisk: Slimhinder oralt er lyserøde og fugtige. Crt > 2 sek. 
- Auskultation cor: To klare veladskilte hjertetoner, uden tegn på mislyd.
- Auskultation pulmones: Normal vesiculær respiration bilateralt i hele lungefeltet
- Lymfeknuder: Palperbare lymfeknuder iab. 
- BCS: _/9

5. IPL (Initial Problem Liste):
IPL: Mangler information fra Dyrlægen

6. Plan til evt. videre forløb:
Mangler information fra Dyrlægen

7. Ejervejledning:
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
