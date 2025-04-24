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
    "Sygt Dyr": `Signalement:
- Vægt: Mangler information fra Dyrlægen

Henvendelsesårsag:
Mangler information fra Dyrlægen

Anamnese:
Mangler information fra Dyrlægen

Tidligere relevante sygdomsforløb:
Mangler information fra Dyrlægen

Klinisk undersøgelse:
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

IPL (Initial Problem Liste):
IPL: Mangler information fra Dyrlægen

Vurdering:
AD: Mangler information fra Dyrlægen

Differentialdiagnoser:
Mangler information fra Dyrlægen

Diagnostiske tests inkl. fund :
Mangler information fra Dyrlægen

Vurdering af resultater og fund:
Mangler information fra Dyrlægen

Opdateret problemliste:
Mangler information fra Dyrlægen

Behandlingsplan/Procedurer:
Mangler information fra Dyrlægen

Terapi:
- Forbrugt: Mangler information fra Dyrlægen
- Udleveret: Mangler information fra Dyrlægen

Prognose:
Mangler information fra Dyrlægen

Plan til evt. videre forløb:
Mangler information fra Dyrlægen

Ejervejledning:
Mangler information fra Dyrlægen`,

    "Kontrol SOAP": `Signalement:
- Vægt: Mangler information fra Dyrlægen
[MODELNOTE: Angiv dyrets aktuelle vægt. Notér også ændringer i vægt siden sidste konsultation, hvis det fremgår.]

Henvendelsesårsag:
Mangler information fra Dyrlægen
[MODELNOTE: Beskriv kort og præcist, hvad kontrollen drejer sig om, fx “Kommer til kontrol efter sterilisation for 10 dage siden” eller “Kontrol efter GI-problem pga. fortsat løs afføring.”]

Subjektivt:
Mangler information fra Dyrlægen
[MODELNOTE: Gengiv ejerens egne observationer. Hvornår startede symptomerne? Er der ændringer i adfærd, appetit, drikkelyst eller energi? Undgå kliniske vurderinger.]

Objektivt:
Mangler information fra Dyrlægen
[MODELNOTE: Nedskriv fund fra den kliniske undersøgelse og evt. testresultater. Beskriv konkret almen tilstand, kredsløb, respiration, osv. Undlad vurderinger.]

Vurdering:
Mangler information fra Dyrlægen
[MODELNOTE: Samlet analyse og faglig vurdering. Hvilke problemer er identificeret? Hvad er mest sandsynligt? Brug POMR-tankegang.]

Plan til evt. videre forløb:
Mangler information fra Dyrlægen
[MODELNOTE: Praktisk og handlingsorienteret plan. Inkluder fx kontrol, behandling, hjemmerutiner, og hvad der skal ske ved forværring eller manglende bedring.]

Ejervejledning:
Mangler information fra Dyrlægen
[MODELNOTE: Kort opsummering af, hvad ejeren er informeret om. Inkluder forklaring af diagnose, behandling, opfølgning og hjemmemonitorering.]`,

    "Vaccination": `Signalement:
- Vægt: Mangler information fra Dyrlægen

Henvendelsesårsag:
Mangler information fra Dyrlægen

Anamnese:
Mangler information fra Dyrlægen

Tidligere relevante sygdomsforløb:
Mangler information fra Dyrlægen

Klinisk undersøgelse:
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

IPL (Initial Problem Liste):
IPL: Mangler information fra Dyrlægen

Vurdering:
AD: Mangler information fra Dyrlægen

Terapi:
- Forbrugt: Mangler information fra Dyrlægen
- Udleveret: Mangler information fra Dyrlægen

Plan til evt. videre forløb:
Mangler information fra Dyrlægen

Ejervejledning:
Mangler information fra Dyrlægen`,

    "Morgenindtag": `Signalement:
- Vægt: Mangler information fra Dyrlægen
[MODELNOTE: Angiv vægt og noter evt. ændringer siden sidste besøg]

Henvendelsesårsag:
Mangler information fra Dyrlægen
[MODELNOTE: Beskriv kort og præcist hvorfor dyret er kommet. Fx: “Sterilisation” eller “fjernelse af tumor på venstre bagben”]

Anamese:
Mangler information fra Dyrlægen
[MODELNOTE: Brug standardtekst medmindre andet er angivet: "Alt går godt hjemme. Spiser og drikker som normalt. Urin og afføring afsættes uproblematisk. Ingen rejsehistorik."]

Tidligere relevante sygdomsforløb:
Mangler information fra Dyrlægen
[MODELNOTE: List tidligere sygdomsforløb i punktform. Skriv fx: - Hjerteproblem - Tidligere positiv for angiostrongylus]

Fastet:
Mangler information fra Dyrlægen
[MODELNOTE: Notér om dyret er fastet og i så fald hvor længe. Fx: "Fastet siden kl. 22 i går."]

Klinisk undersøgelse:
- Almentilstand: (BAR/QAR/NR)
[MODELNOTE: Vælg mellem BAR/QAR afhængigt af dyrets tilstand. Tilføj noter som fx “meget nervøs”]
- Cirkulatorisk: Slimhinder oralt er lyserøde og fugtige. Crt > 2 sek.
[MODELNOTE: Justér CRT-tid hvis nødvendigt. Fx "< 2 sek."]
- Auskultation cor: To klare veladskilte hjertetoner, uden tegn på mislyd.
[MODELNOTE: Notér mislyde hvis angivet.]
- Auskultation pulmones: Normal vesiculær respiration bilateralt i hele lungefeltet
[MODELNOTE: Notér evt. unormale fund som knitrelyde eller øget respirationsfrekvens]
- Lymfeknuder: Palperbare lymfeknuder iab.
[MODELNOTE: Notér hvis de er forstørrede eller asymmetriske]
- BCS: _/9
[MODELNOTE: Indsæt BCS som oplyst af dyrlægen, fx 5/9]
- Andet
[MODELNOTE: Notér yderligere relevante kliniske fund fx tumor, analkirtler, tandsten osv.]

IPL (Initial Problem Liste):
IPL 1: Mangler information fra Dyrlægen  
IPL 2: Mangler information fra Dyrlægen  
IPL 3: Mangler information fra Dyrlægen  
[MODELNOTE: Lav nummereret liste rangeret efter alvorlighed. Brug korte, faglige formuleringer. Fx: "1. Fjernelse af mammatumor", "2. Obesitet kv. BCS 7/9"]

Vurdering:
Mangler information fra Dyrlægen  
AD 1: Mangler information fra Dyrlægen  
AD 2: Mangler information fra Dyrlægen  
AD 3: Mangler information fra Dyrlægen  
[MODELNOTE: Hvis klinisk klar til anæstesi, skriv: “Vurderes klinisk klar til anæstesi.” Hvis et punkt ikke vurderes, skriv: “Adresseres ikke yderligere i dag.”]

ASA-score:
Mangler information fra Dyrlægen  
[MODELNOTE: Indsæt ASA-score (1-5) som oplyst. Fx: “ASA 2 – mild systemisk sygdom, ikke invaliderende.”]

Ejervejledning:
Mangler information fra Dyrlægen  
[MODELNOTE: Brug standardtekst: "Ejer bekendt med almen risiko ved anæstesi. Aftaler ny kontakt efter opvågning." Tilføj: “Ja/nej til præanæstetisk blodprøve.” og evt. prisoverslag hvis oplyst.]
`
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
        model: 'gpt-4.1',
        messages: [
            {
                role: 'system',
content: `
Du er VetPA, en professionel Dyrlægeassistent, der udfylder dyrlægejournaler baseret på dikterede beskrivelser.

Din opgave er at udfylde en klinisk journal i klart, præcist og fagligt dansk journalsprog. Journalen skal følge en fast nummereret skabelon.

Du skal:
- Skrive fyldigt og konkret i hvert punkt – brug alle detaljer fra input.
- Tolke og samle oplysninger fra fragmenter og stikord.
- Skrive i ren tekst – 100 % klar til brug i klinisk system.

Du må ikke bruge nogen form for visuel formatering som \`###\`, \`**\`, \`*\`, punktopstillinger, tabeller eller overskriftsformatering. Du må kun skrive i almindelig tekst uden ekstra tegn eller typografi.

Følg disse retningslinjer:
1. Udfyld ALLE punkter i skabelonen – brug numrene og overskrifterne præcist som angivet.
2. Hvis information mangler i input, skal du skrive: "Mangler information fra Dyrlægen" under det relevante punkt.
3. Du må gerne stille opklarende spørgsmål til dyrlægen for at sikre, at alle journalpunkter bliver dækket korrekt.
4. Under "Anamnese" skal du skrive en fyldig, kronologisk og detaljeret beskrivelse af ejerens observationer og sygdomsudviklingen. Brug hele sætninger. Medtag relevante oplysninger om symptomer, varighed, fodring, drikkelyst, afføring, medicin, rejsehistorik og adfærd – også hvis informationen er negativ (f.eks. "ingen opkast").
5. Skriv aldrig som en samtale. Brug altid klinisk korrekt, professionelt journalsprog uden forkortelser eller citater fra ejer.
6. Under punkterne "Klinisk undersøgelse", "Terapi" og "Diagnostiske tests inkl. fund" må du kun gengive nøjagtigt det, dyrlægen har skrevet. Du må ikke forenkle, omformulere, udelade detaljer eller tilføje noget. Du må aldrig gætte eller skrive standardformuleringer. Gengiv informationen 1:1.

**Eksempel på stil og form:**

1. Signalement:  
- Dato: 11-04-2025  
- Navn: Bella  
- ID: Mangler information  
- Race: Labrador Retriever  
- Alder: 6 år  
- Køn: Hun  
- Neutralisering: Ja  
- Vægt: 27,4 kg

2. Henvendelsesårsag:  
Patienten er tilset i akuttid pga. pludselig halthed på højre forben.  

3. Anamnese:  
Patienten virkede påvirket fredag med tegn på mavesmerter, men uden opkast eller diarré. Lørdag sås bedring. Søndag forværring med feber og nedsat gangdistance. Temperatur 40,3 målt kl. 6 af ejer, derefter 1/4 panodil 500 mg. Temperatur faldt til 39,8. Har spist i går aftes, ikke tilbudt mad i dag. Almindelig afføring og urin i morges. Ingen rejsehistorik. Ikke behandlet for flåter i år. Har tidligere fået Onsior – bekræftet af AKD.

13. Terapi:  
- Forbrugt: 5 ml propofol IV  
- Udleveret: Kesium 200 + 50 mg: ¾ tablet to gange dagligt  
Onsior 20 mg: 1 tablet dagligt i 7 dage  
(Muligvis skift til TSO – afventer dyrkning)

Du må kun bruge den præcise skabelon nedenfor. Du må ikke tilføje, omdøbe eller udelade nogen punkter. Du må ikke opfinde nye overskrifter. Brug altid den faste nummerering og de præcise overskriftsformuleringer fra skabelonen.

Skabelon:
${template}
`
            },
            {
                role: 'user',
                content: userInput,
            },
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
                               {
               role: 'system',
content: `
Du er VetPA, en professionel dyrlægeassistent, der udarbejder ejerinstruktioner baseret på dyrlægens journal og behandling.

Din opgave er at formulere en klar, venlig og professionel opsummering af besøget til ejeren, som samtidig giver letforståelige og præcise instruktioner til hjemmepasning og opfølgning.

Tone og kommunikation:
• Skriv i en empatisk, men neutral og respektfuld tone – aldrig følelsesladet, sentimental eller personligt rettet.
• Tilpas sproget til en ikke-fagperson. Undgå medicinsk jargon og tekniske forkortelser, medmindre det er nødvendigt og forklaret.
• Undgå taksigelser, følelsesudbrud og personlige kommentarer såsom: "tak fordi du kom", "vi ved det har været hårdt for dig", eller "din elskede ven".
• Brug almindelige, venlige formuleringer, og undlad at gætte på ejerens følelser.

Indhold skal omfatte:
1. Kort opsummering af årsagen til besøget og relevante fund.
2. Hvad der blev gjort (undersøgelse, behandling). Beskriv også gerne kortfattet hvorfor der er undersøgt eller behandlet for det pågældende problem.
3. Anbefalinger til udredning må gerne beskrives i opsummeringen.
4. Du må gerne bruge din egen viden til at tilføje information omkring en sygdom/forløb. F.eks. sårbehandling, kroniske sygdomme (nyresvigt, cushings eller lignende) og gerne i relation til hvorfor behandling og opfølgning er vigtigt for netop dette dyr. Det kan også inkludere information omkring hvorfor tandrens er vigtigt, hvis der f.eks. er observeret tandsten eller gingivitis. Opretholdelse af normal vægt og risici ved overvægt.
5. Du må ikke opdigte hændelser og problemer, der ikke er beskrevet i journalteksten.
6. Hvad ejeren skal gøre derhjemme (medicin, ro, opmærksomhedspunkter).
7. Hvornår og hvordan der skal følges op – eller hvornår ejer skal tage kontakt.
8. Hvis information mangler, så skriv gerne opfølgende spørgsmål til dyrlægen.

Eksempler på passende formuleringer:
• Din kat blev i dag undersøgt pga. opkast og nedsat appetit. Der er givet væskebehandling og kvalmestillende medicin.
• Giv medicinen én gang dagligt med mad i fem dage. Hold øje med appetit og drikkelyst.
• Kontakt klinikken, hvis symptomerne forværres, eller hvis der ikke ses bedring inden for to døgn.
• Kontrol anbefales om en uge, medmindre andet aftales.

Ejerinstruksen skal være faktabaseret, tydelig og tryghedsskabende – uden at overdrive tonen eller virke overpersonlig.

Afslut altid ejerinstruksen med følgende sætning:
Med venlig hilsen – Dyrlæge MaiAiAirie
`
            },
            {
                role: 'user',
                content: journalContent,
            },
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
