
import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion, Difficulty, Language } from '../types';

const TOTAL_LEVELS = 30; 
const FREE_PLAY_QUESTIONS = 5;
const DAILY_CHALLENGE_QUESTIONS = 10;

const getDifficultyForLevel = (level: number): Difficulty => {
  if (level <= 5) return 'Leicht';
  if (level <= 15) return 'Mittel';
  return 'Schwer';
};

const getQuestionsCountForLevel = (level: number): number => {
    return level >= 5 ? 10 : 5;
};

const getLanguageName = (lang: Language): string => {
    switch (lang) {
        case 'en': return 'Englisch';
        case 'es': return 'Spanisch';
        case 'de': default: return 'Deutsch';
    }
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateQuiz = async (prompt: string, questionCount: number): Promise<QuizQuestion[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API key is missing. Please set the API_KEY environment variable.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let attempts = 0;
    const maxAttempts = 6; 
    let backoff = 4000; 

    while (attempts < maxAttempts) {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            questions: {
                                type: Type.ARRAY,
                                description: `Eine Liste von ${questionCount} Quizfragen.`,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        question: { type: Type.STRING, description: 'Der Text der Frage.' },
                                        options: { type: Type.ARRAY, description: 'Eine Liste mit 4 möglichen Antworten.', items: { type: Type.STRING } },
                                        correctAnswer: { type: Type.STRING, description: 'Die korrekte Antwort, die mit einer der Optionen übereinstimmen muss.' }
                                    },
                                    required: ['question', 'options', 'correctAnswer']
                                }
                            }
                        },
                        required: ['questions']
                    },
                },
            });

            if (!response.text) {
                 throw new Error("Keine Antwort vom Modell erhalten.");
            }

            let jsonString = response.text.trim();
            jsonString = jsonString.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");

            const parsedResponse = JSON.parse(jsonString);

            if (parsedResponse.questions && Array.isArray(parsedResponse.questions) && parsedResponse.questions.length > 0) {
                return parsedResponse.questions as QuizQuestion[];
            } else {
                console.warn("API returned empty or invalid questions array.", parsedResponse);
                throw new Error("Ungültige Datenstruktur von der API.");
            }
        } catch (error: any) {
            attempts++;
            
            let isQuotaError = false;
            const msg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));

            if (error.status === 429 || error.code === 429) isQuotaError = true;
            if (error.error?.code === 429 || error.error?.status === 'RESOURCE_EXHAUSTED') isQuotaError = true;
            if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) isQuotaError = true;

            if (isQuotaError) {
                console.warn(`Quota exceeded (Versuch ${attempts}/${maxAttempts}). Warte ${backoff}ms...`);
                if (attempts >= maxAttempts) {
                     console.error(`Fehler beim Abrufen der Quizfragen (Quota erschöpft):`, error);
                     throw new Error("Der Server ist momentan ausgelastet (Limit erreicht). Bitte warte ca. 20 Sekunden und versuche es dann erneut.");
                }
                await delay(backoff);
                backoff = Math.min(backoff * 1.5, 15000); 
                continue;
            }

            console.error(`Fehler beim Abrufen der Quizfragen (Versuch ${attempts}):`, error);
            if (attempts >= maxAttempts) {
                 throw new Error("Die Quizfragen konnten nicht geladen werden. Bitte überprüfe deine Internetverbindung.");
            }
             await delay(2000);
        }
    }
    throw new Error("Unbekannter Fehler beim Laden der Fragen.");
}

export const fetchQuizQuestions = async (level: number, previousQuestions: string[], language: Language = 'de'): Promise<QuizQuestion[]> => {
  const difficulty = getDifficultyForLevel(level);
  const questionCount = getQuestionsCountForLevel(level);
  const langName = getLanguageName(language);

  const difficultyPrompt = `Der Schwierigkeitsgrad der Fragen sollte ${difficulty.toLowerCase()} sein und für Level ${level} von insgesamt ${TOTAL_LEVELS} angemessen sein. Jedes Level sollte schrittweise anspruchsvoller werden.`;

  const sanitizedPreviousQuestions = previousQuestions.map(q => q.replace(/"/g, "'"));
  const uniquenessPrompt = sanitizedPreviousQuestions.length > 0
    ? `WICHTIG: Die neuen Fragen dürfen NICHT aus der folgenden Liste bereits gestellter Fragen stammen: "${sanitizedPreviousQuestions.join('", "')}"`
    : '';

  const prompt = `Erstelle ein Quiz mit ${questionCount} neuen, allgemeinen Wissensfragen auf ${langName}. ${difficultyPrompt} Die Fragen sollten ein breites Themenspektrum abdecken (z.B. Geschichte, Wissenschaft, Geografie, Popkultur). Gib für jede Frage 4 mögliche Antworten an. ${uniquenessPrompt}`;

  return generateQuiz(prompt, questionCount);
};

export const fetchFreePlayQuizQuestions = async (difficulty: Difficulty, previousQuestions: string[], language: Language = 'de'): Promise<QuizQuestion[]> => {
    const difficultyPrompt = `Der Schwierigkeitsgrad der Fragen sollte ${difficulty.toLowerCase()} sein.`;
    const langName = getLanguageName(language);

    const sanitizedPreviousQuestions = previousQuestions.map(q => q.replace(/"/g, "'"));
    const uniquenessPrompt = sanitizedPreviousQuestions.length > 0
        ? `WICHTIG: Die neuen Fragen dürfen NICHT aus der folgenden Liste bereits gestellter Fragen stammen: "${sanitizedPreviousQuestions.join('", "')}"`
        : '';
    
    const prompt = `Erstelle ein Quiz im "Freimodus" mit ${FREE_PLAY_QUESTIONS} neuen, allgemeinen Wissensfragen auf ${langName}. ${difficultyPrompt} Die Fragen sollten ein breites Themenspektrum abdecken (z.B. Geschichte, Wissenschaft, Geografie, Popkultur). Gib für jede Frage 4 mögliche Antworten an. ${uniquenessPrompt}`;

    return generateQuiz(prompt, FREE_PLAY_QUESTIONS);
};

export const fetchDailyChallengeQuestions = async (previousQuestions: string[], language: Language = 'de'): Promise<QuizQuestion[]> => {
    const sanitizedPreviousQuestions = previousQuestions.map(q => q.replace(/"/g, "'"));
    const uniquenessPrompt = sanitizedPreviousQuestions.length > 0
        ? `WICHTIG: Die neuen Fragen dürfen NICHT aus der folgenden Liste bereits gestellter Fragen stammen: "${sanitizedPreviousQuestions.join('", "')}"`
        : '';
    
    const langName = getLanguageName(language);

    const prompt = `Erstelle eine "Tägliche Herausforderung" mit ${DAILY_CHALLENGE_QUESTIONS} neuen, allgemeinen Wissensfragen auf ${langName}. 
    WICHTIG: Die Fragen müssen eine bunte Mischung aus verschiedenen Schwierigkeitsgraden sein: 
    - Ca. 30% Leichte Fragen (für Einsteiger)
    - Ca. 40% Mittlere Fragen
    - Ca. 30% Schwere Fragen (für Experten)
    Die Fragen sollten bunt gemischt sein. Gib für jede Frage 4 mögliche Antworten an. ${uniquenessPrompt}`;

    return generateQuiz(prompt, DAILY_CHALLENGE_QUESTIONS);
};
    