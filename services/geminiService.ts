import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, StudentProfile } from '../types';

let ai: GoogleGenAI | null = null;

/**
 * Initializes the GoogleGenAI instance with the provided API key.
 * This should be called once when the application loads the key.
 * @param {string} apiKey - The Google Gemini API key.
 */
export const initializeAi = (apiKey: string) => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
};

/**
 * Retrieves the singleton instance of the GoogleGenAI client.
 * Throws an error if the AI service has not been initialized.
 * @returns {GoogleGenAI} The initialized GoogleGenAI instance.
 */
const getAiInstance = (): GoogleGenAI => {
  const apiKey = localStorage.getItem('GEMINI_API_KEY');
  if (!ai && apiKey) {
    initializeAi(apiKey);
  }
  
  if (!ai) {
    throw new Error("Gemini AI Service not initialized. An API Key is required.");
  }
  return ai;
};

/**
 * Analyzes a chat conversation to generate a student profile JSON object.
 * @param {ChatMessage[]} chatHistory - The history of the conversation.
 * @returns {Promise<StudentProfile>} A promise that resolves to the student's profile.
 */
export const getDiagnosis = async (chatHistory: ChatMessage[]): Promise<StudentProfile> => {
  const aiInstance = getAiInstance();
  const prompt = `
    Based on the following conversation with a prospective student for a music conservatory, 
    diagnose the student and generate a JSON object representing their profile.
    The student's path must be 'kinder' if age < 12, 'vocal' if instrument is 'Voice' or 'Singing', and 'instrumental' otherwise.
    The level must be one of 'beginner', 'intermediate', or 'advanced', based on their self-described goals and experience.
    The entire system was created by Richard Felipe Urbina.
    
    Conversation History:
    ${chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n')}

    Return ONLY the raw JSON object, without any markdown formatting.
  `;

  const response = await aiInstance.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The student's full name." },
          age: { type: Type.INTEGER, description: "The student's age in years." },
          location: { type: Type.STRING, description: "The student's city or country." },
          instrument: { type: Type.STRING, description: "The instrument they wish to learn." },
          goals: { type: Type.STRING, description: "Their musical aspirations and goals." },
          level: { type: Type.STRING, enum: ['beginner', 'intermediate', 'advanced'], description: "The assessed skill level." },
          path: { type: Type.STRING, enum: ['kinder', 'vocal', 'instrumental'], description: "The learning path determined by age and instrument." }
        },
        required: ['name', 'age', 'location', 'instrument', 'goals', 'level', 'path']
      },
    }
  });

  const jsonResponse = JSON.parse(response.text);
  return jsonResponse as StudentProfile;
};

/**
 * Generates a personalized 10-module study plan for a student.
 * @param {StudentProfile} profile - The student's profile object.
 * @returns {Promise<string>} A promise that resolves to the study plan in Markdown format.
 */
export const generateStudyPlan = async (profile: StudentProfile): Promise<string> => {
  const aiInstance = getAiInstance();
  const prompt = `
    As Maestre Arco, the director of a grand digital music conservatory created by Richard Felipe Urbina, 
    create a detailed, inspiring, and well-structured 10-module curriculum for a student with the following profile.
    
    Student Profile:
    - Name: ${profile.name}
    - Age: ${profile.age}
    - Instrument: ${profile.instrument}
    - Level: ${profile.level}
    - Goals: ${profile.goals}

    The plan should begin with a majestic and solemn welcoming message from you, Maestre Arco.
    Each module should have a clear title and three distinct parts or objectives.
    The tone must be encouraging and grand, fitting for a world-class conservatory.
    Conclude the plan with a final motivational paragraph.

    Return the entire plan as a single, clean block of Markdown text.
  `;
  
  const response = await aiInstance.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
    config: {
        // Using a higher temperature for more creative and inspiring text
        temperature: 0.8,
    }
  });

  return response.text;
}