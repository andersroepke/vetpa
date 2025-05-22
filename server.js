const { getEnvVariable } = require('./utilities');
const OpenAI = require('openai');
const OPENAI_API_KEY = getEnvVariable('OPENAI_API_KEY');
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });



// /**
//  * Validate the AI response for known invalid patterns or placeholders.
//  * @param {Object} response
//  * @returns {boolean}
//  */
// function validateResponse(response) {
//   if (!response || !response.choices || response.choices.length === 0) {
//     return false;
//   }

//   const content = response.choices[0].message?.content?.trim();
//   if (!content || content.length < 20) {
//     return false;
//   }

//   const lines = content.split("\n").filter(line => line.trim().length > 5);
//   if (lines.length < 5) {
//     return false;
//   }

//   const invalidPatterns = [
//     /^###$/,
//     /^Ukendt$/,
//     /^Mangler oplysninger$/,
//     /^Ingen oplysninger$/,
//   ];

//   if (invalidPatterns.some(pattern => pattern.test(content))) {
//     return false;
//   }

//   return true;
// }


// const maxRetries = 3;
// let attempt = 0;

// while (attempt < maxRetries) {
//   const data = {
//     model: 'gpt-4.1',
//     messages: [
//       { role: 'system', content: `${prompt}: \n ${template}` },
//       { role: 'user', content: patientClinicalStudy },
//     ],
//   };

//   const response = await openai.chat.completions.create(data);
//   attempt++;

//   if (validateResponse(response)) {
//     return response.choices?.[0]?.message?.content;
//   }
// }


/**
 * Generates formatted veterinary journal content using AI based on a given template and user input.
 *
 * @param {string} patientClinicalStudy
 * @param {string} template
 * @param {string} notes
 */
async function fillJournalTemplateContent(patientClinicalStudy, template, notes) {
  try {
    const prompt = `
Du er VetPA, en professionel Dyrlægeassistent, der udfylder dyrlægejournaler baseret på dikterede beskrivelser eller optagelser af samtaler, konsultation og videokonsultationer.

Din opgave er at udfylde en klinisk journal i klart, præcist og fagligt dansk journalsprog. Journalen skal følge en fast nummereret skabelon.

Du skal:
- Skrive fyldigt og konkret i hvert punkt – brug alle detaljer fra input.
- Tolke og samle oplysninger fra fragmenter og stikord.
- Skrive i ren tekst – 100 % klar til brug i klinisk system.

Du må ikke bruge nogen form for visuel formatering som \`###\`, \`**\`, \`*\`, punktopstillinger, tabeller eller overskriftsformatering. Du må kun skrive i almindelig tekst uden ekstra tegn eller typografi.

Følg disse retningslinjer:
1. Udfyld ALLE punkter i skabelonen – brug numrene og overskrifterne præcist som angivet.
2. Hvis information mangler i input, skal du skrive: "Mangler information fra Dyrlægen" under det relevante punkt.
3. Du må gerne stille opklarende spørgsmål til dyrlægen for at sikre, at alle journalpunkter bliver dækket korrekt. Opklarende spørgsmål skal altid holdes i journalen og aldrig i opsummeringen til ejer.
4. Under "Anamnese" skal du skrive en fyldig, kronologisk og detaljeret beskrivelse af ejerens observationer og sygdomsudviklingen. Brug hele sætninger. Medtag relevante oplysninger om symptomer, varighed, fodring, drikkelyst, afføring, medicin, rejsehistorik og adfærd – også hvis informationen er negativ (f.eks. "ingen opkast").
5. Skriv aldrig som en samtale. Brug altid klinisk korrekt, professionelt journalsprog uden forkortelser eller citater fra ejer.
6. Under punkterne "Klinisk undersøgelse", "Terapi" og "Diagnostiske tests inkl. fund" må du kun gengive nøjagtigt det, dyrlægen har skrevet. Du må ikke forenkle, omformulere, udelade detaljer eller tilføje noget. Du må aldrig gætte eller skrive standardformuleringer. Gengiv informationen 1:1.
7. Skriv ALTID udelukkende på korrekt dansk MEDMINDRE jeg beder dig om at skrive på et andet sprog. Brug aldrig norsk eller svensk, hverken helt eller delvist medmindre jeg beder dig om det.]
8. Brug navn og køn på dyret
9. Skriv differentialdiagnoser i en sætning med , mellem hver diagnose. Du må ikke skrive i punkter eller angive numre for hver differentialdiagnose, men der skal være numre for hvert problem fra IPL punktet

**Eksempel på stil og form:**

Signalement:
- Vægt: 27,4 kg

Henvendelsesårsag:
Patienten er tilset i akuttid pga. pludselig halthed på højre forben.  

Anamnese:
Patienten virkede påvirket fredag med tegn på mavesmerter, men uden opkast eller diarré. Lørdag sås bedring. Søndag forværring med feber og nedsat gangdistance. Temperatur 40,3 målt kl. 6 af ejer, derefter 1/4 panodil 500 mg. Temperatur faldt til 39,8. Har spist i går aftes, ikke tilbudt mad i dag. Almindelig afføring og urin i morges. Ingen rejsehistorik. Ikke behandlet for flåter i år. Har tidligere fået Onsior – bekræftet af AKD.

Terapi:
- Forbrugt: 5 ml propofol IV  
- Udleveret: Kesium 200 + 50 mg: ¾ tablet to gange dagligt  
Onsior 20 mg: 1 tablet dagligt i 7 dage  
(Muligvis skift til TSO – afventer dyrkning)

Du må kun bruge den præcise skabelon nedenfor. Du må ikke tilføje, omdøbe eller udelade nogen punkter. Du må ikke opfinde nye overskrifter. Brug altid de præcise overskriftsformuleringer fra skabelonen.

Skabelon:
`;

    const finalPrompt = `${prompt}: \n\nTEMPLATE:${template} \n\n NOTES:${notes}`;

    const data = {
      model: 'gpt-4.1',
      messages: [
        { role: 'system', content: finalPrompt },
        { role: 'user', content: patientClinicalStudy },
      ],
    };

    const response = await openai.chat.completions.create(data);
    return response.choices?.[0]?.message?.content;
  } catch (error) {
    throw new Error(`Error in fillJournalTemplateContent: ${error.message}`);
  }
}



/**
 * Generates a short owner-focused summary of the journal content using OpenAI.
 *
 * @param {string} journalContent
 * @param {string} notes
 * @param {string} veterinarianName
 */
async function generateJournalContentSummary(journalContent, notes, veterinarianName) {
  try {
    const prompt = `
Du er VetPA, en professionel dyrlægeassistent, der udarbejder ejerinstruktioner baseret på dyrlægens journal og behandling.

Din opgave er at formulere en klar, venlig og professionel opsummering af besøget til ejeren, som samtidig giver letforståelige og præcise instruktioner til hjemmepasning og opfølgning.

Tone og kommunikation:
• Skriv i en empatisk, men neutral og respektfuld tone – aldrig følelsesladet, sentimental eller personligt rettet.
• Tilpas sproget til en ikke-fagperson. Undgå medicinsk jargon, fagsprog og tekniske forkortelser, medmindre det er nødvendigt og forklaret.
•	Medtag aldrig signalementet i instruksen.
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
[Dyrlægens fornavn]




**Medicinske produkter**

Dexdomitor (0,1 mg/ml eller 0,5 mg/ml), Cepedex
Comfortan
Ketamin
Alfax, alfaxalon
Propofol, proposer, propovet
Antisedan
Metacam, loxicom, meloxicom, meloxicam, inflacam
Onsior
Prevomax, vetemex, vominil, cerenia
Zoletil
Euthanimal, exagon, euthasol
Midazolam
Diazepam, stesolid, diazedor
Vetergesic, bupredine, bupaq
Alvegesic, butormidor, butorgesic, morphasol, torbudine, dolorex, torbugesic
Fentadon
Hemosilate
Plegicil


Vacciner:
Nobivac DHPPi, Nobivac DHP, Nobivac PI, Nobivac L4, Nobivac rabies, Nobivac BbPi, Nobivac DP plus, Nobivac ducat, Nobivactricat

Purevax rabies, Purevax FeLV, Purevax RC, Purevax RCP, Purevax RCP FeLV, Purevax RCPCh, Purevax RCPCh FeLV

Spasmium
Rivalgin
Dexaject, rapidexon, dexamethasone

Prednicortone, hedylon, equisolon, dermipred,


Tralieve 20 eller 80 mg.
Galliprant

Antibiotika
Amoxicillin: Amoxibactin, amoxival, clamoxyl, noromox prolongatum
Amoxicillin+clavulansyre: Kesium, Noroclav, spectrabactin, clavucil,
Clindamycin: Clindabactin, Antirobe, clinacin, Clindaseptin, Givix,
enrofloxacin: Baytril, exoflox, Xeden


Bravecto
Advocate
Panacur
Milbemax, milpro, Milbactor
Droncit, Drontal
Frontline
Nexgard
Stronghold, Stronghold plus

Clevor
Apomorfin
Metomotyl, primperan,

Suprelorin

Atopica,

Forthyron, Caninsulin, proZinc, Felimazole, Thiacare, Apelka, Semintra, Fortekor, Zycortal, Propaline, Incurin,

Cardisure, Pimotab, Cardalis, Fortekor plus, Isemid, Libeo, Vetmedin, Upcard, Zelys

Clomicalm, reconcile, Sileo, Tessie, Bonqat

Cytopoint, Librela, Cartrophen, Depo-Medrol, Osteopen, Solensia

Felpreva

Galastop

Canaural, otisur, surolan, neptra, sanotic, osurnia, recicort, easotic, cortortic, otomax

Otodine, Otoact, triz-chlor, Tris-NAC,


Tilskudsprodukter: Pro-kolin, zoolac,
`;
    const finalContent = `CONTENT:${journalContent} \n\n VETERINARIAN_NAME:${veterinarianName} \n\n NOTES:${notes}`;

    const data = {
      model: 'gpt-4.1',
      messages: [
        { role: 'system', content: `${prompt}` },
        { role: 'user', content: finalContent },
      ],
    };

    const response = await openai.chat.completions.create(data);
    return response.choices?.[0]?.message?.content;
  } catch (error) {
    throw new Error(`Error in generateJournalContentSummary: ${error.message}`);
  }
}


/**
 * Transcribes an audio file using OpenAI Whisper API.
 *
 * @param {string} audioFileSteam
 * @param {string} language
 * @returns {Promise<string>}
 */
async function transcribeAudioFile(audioFileSteam, language) {
  try {
    const prompt = ``;
     const data = {
      file: audioFileSteam,
      model: "whisper-1",
      prompt: `${prompt}`,
      language,
      // response_format: "text",
    };

    const response = await openai.audio.transcriptions.create(data);
    return response.text;
  } catch (error) {
    throw new Error(`Transcription failed: ${error.response?.data?.error?.message || error.message}`);
  }
}



/**
 * Extracts structured patient data (countryCode, name, birthDate, animalType) from clinical text using OpenAI.
 *
 * @param {string} patientClinicalStudy
 * @returns {Promise<object>}
 */
async function extractPatientData(patientClinicalStudy) {
  try {
    const prompt = `
Du er en AI-assistent, der udtrækker strukturerede data fra kliniske undersøgelsestekster. Udpak følgende felter:
- countryCode (2-bogstavs kode)
- name (Fullname)
- birthDate (YYYY-MM-DD)
- animalType (dyretype)
- gender (MALE | FEMALE)
- breed (Animal breed)
- chipNumber (string)
- isNeutralized (boolean)
- uniqueId (XX-XX-XXXXXX-XXXX)
Returner et gyldigt JSON-objekt med fundne felter. Returner ikke ugyldige eller manglende felter. Hvis der ikke findes nogen gyldige data, returneres null.
`;

    const userMessage = `TEXT: ${patientClinicalStudy}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userMessage }
      ],
      // temperature: 0,
      // max_tokens: 50
    });

    const result = response.choices?.[0]?.message?.content;
    if (result) {
      try {
        const match = result.match(/{[\s\S]*}/);
        if (match) {
          const jsonString = match[0]
          const data = JSON.parse(jsonString);
          return data;
        }
      } catch (error) {
      }
    }
    return null;
  } catch (error) {
    throw new Error(`Error in extractPatientData: ${error.message}`);
  }
}



module.exports = {
  fillJournalTemplateContent,
  generateJournalContentSummary,
  transcribeAudioFile,
  extractPatientData,
};
