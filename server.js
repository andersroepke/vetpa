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
[MODELNOTE: Notér altid dyrets aktuelle vægt. Hvis muligt, angiv ændring i forhold til sidste besøg i parentes. Du må gerne automatisk beregne og notere forskellen, hvis data er tilgængelig.]

Henvendelsesårsag:
Mangler information fra Dyrlægen
[MODELNOTE: Her beskrives kort, hvorfor dyret er kommet til klinikken i dag.]

Anamnese:
Mangler information fra Dyrlægen
[MODELNOTE: Beskriv ejerens observationer og sygdomsudvikling kronologisk og detaljeret. Medtag både positive og negative fund. Brug hele sætninger og korrekt fagsprog.]

Tidligere relevante sygdomsforløb:
Mangler information fra Dyrlægen
[MODELNOTE: List tidligere relevante sygdomme i punktform. Brug data fra journal eller anamnese.]

Klinisk undersøgelse:
- Almentilstand: (BAR/QAR/NR)
[MODELNOTE: Angiv BAR, QAR eller NR – og beskriv evt. nervøsitet.]
- Cirkulatorisk: Slimhinder oralt er lyserøde og fugtige. Crt > 2 sek. 
[MODELNOTE: Justér CRT hvis relevant. Fx < 2 sek.]
- Auskultation cor: To klare veladskilte hjertetoner, uden tegn på mislyd.
[MODELNOTE: Angiv evt. mislyde.]
- Pulsrate: Mangler information fra Dyrlægen
[MODELNOTE: Angiv pulsfrekvensen som oplyst.]
- Auskultation pulmones: Normal vesiculær respiration bilateralt i hele lungefeltet
[MODELNOTE: Angiv evt. knitrelyde eller mislyde.]
- Respirationstype: thoracoabdominal respiration
[MODELNOTE: Notér evt. andre respirationstyper eller anstrengt respiration.]
- Lymfeknuder: Palperbare lymfeknuder iab. 
[MODELNOTE: Notér hvis forstørrede eller asymmetriske.]
- Abdomen: blød og indolent, uden tegn på patologiske udfyldninger
[MODELNOTE: Angiv evt. ømhed, udfyldninger eller spændt bug.]
- Tænder og tandkød: iab
[MODELNOTE: Notér fx tandsten, gingivitis.]
- Ører: iab
[MODELNOTE: Angiv cerumen, erythem, smerte.]
- Øjne: iab
[MODELNOTE: Notér sekretion, inflammation, misfarvning.]
- Bevægeapparat: iab
[MODELNOTE: Angiv evt. halthed, stivhed.]
- Mammae/testes: iab
[MODELNOTE: Brug "mammae" for intakte tæver, "testes" for intakte hanhunde. Udelad for kastrerede hanner.]
- BCS: _/9
[MODELNOTE: Indsæt vurderet BCS (fx 5/9) som oplyst af dyrlægen.]
- Temperatur: Mangler information fra Dyrlægen
[MODELNOTE: Indsæt målt temperatur.]
- Hydreringsstatus: Mangler information fra Dyrlægen
[MODELNOTE: Angiv fx “normal”, “dehydreret”, “let nedsat hudturgor”.]

IPL:
Mangler information fra Dyrlægen
[MODELNOTE: Skriv initial problem liste som nummereret liste i fagligt sprog, ud fra anamnese og kliniske fund.]

Vurdering:
AD: Mangler information fra Dyrlægen
[MODELNOTE: Brug AD 1, AD 2 osv. og vurder hvert punkt: bekræftet/ikke bekræftet, lokaliseret/organsystem, diagnostisk plan.]

Differentialdiagnoser:
Mangler information fra Dyrlægen
[MODELNOTE: Medtag både dyrlægens og fagligt relevante differentialdiagnoser. Prioritér rækkefølgen.]

Diagnostiske tests inkl. fund :
Mangler information fra Dyrlægen
[MODELNOTE: Opsummer hvilke tests der er udført og de konkrete fund. Skriv kortfattet i korrekt fagsprog.]

Vurdering af resultater og fund:
Mangler information fra Dyrlægen
[MODELNOTE: Evaluer fundene. Medtag dyrlægens vurdering og suppler med evidensbaseret analyse hvis relevant.]

Opdateret problemliste:
Mangler information fra Dyrlægen
[MODELNOTE: Formuler opdateret problemliste med evt. diagnose. Brug kortfattet fagsprog.]

Behandlingsplan/Procedurer:
Mangler information fra Dyrlægen
[MODELNOTE: Beskriv den aftalte behandlingsplan og/eller planlagte procedurer i klinisk korrekt og kortfattet form.]

Terapi:
- Forbrugt: Mangler information fra Dyrlægen  
[MODELNOTE: Notér nøjagtigt hvad der er givet i klinikken inkl. dosis og administrationsvej.]

- Udleveret: Mangler information fra Dyrlægen  
[MODELNOTE: Notér udleveret medicin inkl. styrke, dosis, administrationsform, behandlingsvarighed, indikation og evt. bivirkninger.]

Prognose:
Mangler information fra Dyrlægen
[MODELNOTE: Angiv prognose baseret på dyrlægens information – eller vurder fagligt ud fra samlede fund.]

Plan til evt. videre forløb:
Mangler information fra Dyrlægen
[MODELNOTE: Beskriv hvad næste skridt er, hvis bedring ikke ses. Angiv kontroltidspunkt, opfølgende tests, og om specifik dyrlæge er ønsket.]

Ejervejledning:
Mangler information fra Dyrlægen
[MODELNOTE: Notér hvad ejer er informeret om. Brug evt. standardtekst ved vaccination. Angiv hvis der er givet prisoverslag.]`,

    "Kort Journal": ` 
 1. Signalement:
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
       
       4. Klinisk undersøgelse:
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
       
       5. IPL (Initial Problem Liste):
       IPL: Mangler information fra Dyrlægen
       
       6. Differentialdiagnoser:
       Mangler information fra Dyrlægen
       
       7. Diagnostiske tests inkl. fund :
       - Blodprøver: Mangler information fra Dyrlægen
       - Billeddiagnostik: Mangler information fra Dyrlægen
       - Urinanalyse: ingen information
       - Afføringsprøver: ingen information
       - Indsendte prøver: ingen information om bar-code
       
       8. Terapi:
       - Forbrugt: Mangler information fra Dyrlægen
       - Udleveret: Mangler information fra Dyrlægen
       
       9. Plan til evt. videre forløb:
       Mangler information fra Dyrlægen
       
       10. Ejervejledning:
       Mangler information fra Dyrlægen
     `,

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
    "Vaccination": `Vægt:
- Vægt: Mangler information fra Dyrlægen
[MODELNOTE: Notér altid dyrets aktuelle vægt. Hvis muligt, angiv ændring i forhold til sidste besøg i parentes.]

Henvendelsesårsag:
Mangler information fra Dyrlægen
[MODELNOTE: Beskriv kort og præcist hvorfor dyret er kommet. Fx: “Sterilisation”, “fjernelse af tumor” eller “medicinsk udredning for PU/PD”.]

Anamnese:
Mangler information fra Dyrlægen
[MODELNOTE: Brug standardtekst medmindre andet er angivet: "Alt går godt hjemme. Spiser og drikker som normalt. Urin og afføring afsættes uproblematisk. Ingen rejsehistorik."]

Tidligere relevante sygdomsforløb:
Mangler information fra Dyrlægen
[MODELNOTE: List tidligere relevante sygdomme eller konsultationer i punktform. Fx: - Hjerteproblem, - Tidligere angiostrongylus-infektion.]

Klinisk undersøgelse:
- Almentilstand: (BAR/QAR/NR)
[MODELNOTE: Vælg mellem BAR/QAR. Notér også fx "meget nervøs på klinikken" hvis relevant.]
- Cirkulatorisk: Slimhinder oralt er lyserøde og fugtige. Crt > 2 sek.
[MODELNOTE: Justér CRT ud fra undersøgelse, fx "< 2 sek." hvis normalt.]
- Auskultation cor: To klare veladskilte hjertetoner, uden tegn på mislyd.
[MODELNOTE: Notér mislyde hvis angivet.]
- Auskultation pulmones: Normal vesikulær respiration bilateralt i hele lungefeltet
[MODELNOTE: Tilføj thoracoabdominal hvis det er oplyst. Notér unormale fund.]
- Respirationstype: thoracoabdominal respiration
[MODELNOTE: Notér her hvis anden respirationstype eller unormale lyde ses.]
- Lymfeknuder: Palperbare lymfeknuder iab.
[MODELNOTE: Notér evt. forstørrelse eller asymmetri.]
- Abdomen: blød og indolent, uden tegn på patologiske udfyldninger
[MODELNOTE: Hvis der findes tumor eller spændt abdomen, notér det her.]
- Tænder og tandkød: iab
[MODELNOTE: Tilføj fx tandsten eller gingivitis hvis fundet.]
- Ører: iab
[MODELNOTE: Notér fx cerumen, erythem, smerte ved berøring.]
- Øjne: iab
[MODELNOTE: Tilføj fx konjunktivitis, sekret, unormale pupiller.]
- Bevægeapparat: iab
[MODELNOTE: Tilføj fx halthed, stivhed, muskelatrofi.]
- Mammae/testes: iab
[MODELNOTE: Brug mammae for intakte hunhunde, testes for intakte hanhunde. Udelad for kastrerede hanner.]
- BCS: _/9
[MODELNOTE: Indsæt vurderet BCS, fx 5/9.]

IPL (Initial Problem Liste):
IPL: Mangler information fra Dyrlægen
[MODELNOTE: Lav nummereret liste baseret på fund og anamnese. Vær fagligt kortfattet og neutral. Fx: "1. Mammatumor venstre side ca. 2 cm", "2. Øreinfektion bilateralt".]

Vurdering:
AD: Mangler information fra Dyrlægen
[MODELNOTE: Opskriv som AD 1, AD 2 osv. i henhold til IPL.
For hvert punkt vurderes:
• Er problemet bekræftet? (det kan enten være ud fra anamnese eller fund på den kliniske undersøgelse. Hvis ikke det kan bekræftes som f.eks. udtalelsen ”den drikker måske lidt mere” så skrives ”Problemet er ikke bekræftet”).
• Kan det lokaliseres til et organsystem? (f.eks. huden, kredsløbet, GI kanalen, bevægeapparatet mm. Du må gerne skrive hvor det er lokaliseret til. Hvis ikke det umiddelbart kan lokaliseres, men er bekræftet skrives ”Bekræftet, men ikke lokaliseret”. Hvis det hverken kan bekræftes eller lokaliseres skrives ”Hverken bekræftet eller lokaliseret”. Men som oftest vil det være muligt at skrive ”Bekræftet og lokaliseret til…” og indsætte relevant organsystem).
• Hvad er den videre diagnostiske plan? (f.eks. blodprøver, urinanalyse, FNA, billeddiagnostik. Her må du gerne komme med forslag til hvad du ud fra din samlede viden tænker kunne være relevant at udføre).
• Ved en konsultation vælger dyrlægen nogle gange ikke at beskæftige sig yderligere med et punkt. I det tilfælde skal du blot under vurdering skrive ”Adresseres ikke yderligere i dag”.
• For vaccination: "Dyret vurderes klar til vaccination." Angiv hvis vaccination er udløbet.
• Kom gerne med forslag til differentialdiagnoser under hvert punkt, men hold det kortfattet.

Eksempel:
AD 1: Bekræftet og lokaliseret til huden. Videre udredning med allergiblodprøve og fodertrial samt lokal rens af øret og huden mellem trædepuderne. Ddx: allergi, infektion, fremmedlegeme.
AD 2: Bekræftet og lokaliseret til mammae. Videre udredning med FNA samt operation/histopatologi samt evt staging inden med FNA af drænerende lymfeknuder og thoraxrøntgen. Ddx: neoplasi (benign og malign), infektion.
AD 3: Bekræftet og lokaliseret. Analkirtler tømt. Da det er første gang han har problemer med analkirtler, adresseres problemet ikke yderligere i dag.
AD 4: Vurderes klar til vaccination. L4 udløbet, hvorfor revaccination om 3-4 uger anbefales.]

Terapi:
- Forbrugt: Mangler information fra Dyrlægen
[MODELNOTE: Notér navn på præparat, styrke, dosis, administrationsvej, givet på klinikken. Fx: "Metacam 5 mg/ml inj. 0,2 ml sc. givet på klinikken."]

- Udleveret: Mangler information fra Dyrlægen
[MODELNOTE: Notér præparatnavn, styrke, dosering, hyppighed, varighed, indikation, forsigtighed. Fx: "Onsior 20 mg: 1 tbl. x1 dagligt i 5 dage mod smerte."]

Plan til evt. videre forløb:
Mangler information fra Dyrlægen
[MODELNOTE: Beskriv opfølgning, kontroltidspunkt, videre diagnostik (fx ultralyd, blodprøve), og om specifik dyrlæge skal håndtere det.]

Ejervejledning:
Mangler information fra Dyrlægen
[MODELNOTE: Notér kort hvad ejer blev informeret om. Brug fx: "Ejer informeret om almindelige bivirkninger ved vaccination" eller "Anbefalet tandrens indenfor 3-6 mdr."]`,

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
7. Skriv ALTID udelukkende på korrekt dansk MEDMINDRE jeg beder dig om at skrive på et andet sprog. Brug aldrig norsk eller svensk, hverken helt eller delvist medmindre jeg beder dig om det.]

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
Med venlig hilsen
Dyrlægen
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
