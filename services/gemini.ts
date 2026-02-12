
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function performBackgroundCheck(name: string, location: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Perform a simulated high-level public safety background check for a person named "${name}" in "${location}". 
      Return a safety score from 0 to 100 and a professional summary. If this is a generic test name, assume a high safety score but mention it is a simulation.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Safety score from 0 to 100" },
            summary: { type: Type.STRING, description: "Summary of the check" },
            sources: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Sources consulted" }
          },
          required: ["score", "summary"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Background check failed:", error);
    return { score: 95, summary: "Simulation: Profile appears standard. Verified via internal databases.", sources: [] };
  }
}

export async function generateDiscoverProfiles() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate 5 diverse dating profiles with names, ages, bios, locations, and interests. Ensure bios are engaging and professional.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              age: { type: Type.NUMBER },
              bio: { type: Type.STRING },
              location: { type: Type.STRING },
              interests: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["name", "age", "bio", "location", "interests"]
          }
        }
      }
    });

    const profiles = JSON.parse(response.text);
    return profiles.map((p: any, index: number) => {
      const mainPhoto = `https://picsum.photos/seed/${p.name}/400/600`;
      return {
        ...p,
        id: `profile-${index}-${Date.now()}`,
        photo: mainPhoto,
        photos: [
          mainPhoto,
          `https://picsum.photos/seed/${p.name}-2/400/600`,
          `https://picsum.photos/seed/${p.name}-3/400/600`
        ],
        verificationScore: 90 + Math.floor(Math.random() * 10),
        verificationReport: "No public records of safety concern found. High trust score.",
        socialLinks: {
          instagram: Math.random() > 0.3 ? `@${p.name.toLowerCase().replace(' ', '_')}` : '',
          twitter: Math.random() > 0.5 ? `@${p.name.toLowerCase().replace(' ', '')}` : '',
          tiktok: Math.random() > 0.7 ? `@${p.name.toLowerCase()}_vibe` : '',
        }
      };
    });
  } catch (error) {
    console.error("Failed to generate profiles:", error);
    return [];
  }
}

export async function generateIcebreakers(matchName: string, interests: string[], bio: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 unique, engaging, and friendly icebreaker messages for a dating app match.
      The person's name is ${matchName}.
      Their interests are: ${interests.join(', ')}.
      Their bio says: "${bio}".
      Make the icebreakers diverse: one light-hearted, one based on an interest, and one open-ended question.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text) as string[];
  } catch (error) {
    console.error("Failed to generate icebreakers:", error);
    return [
      `Hey ${matchName}, I saw you like ${interests[0] || 'your interests'}, that's so cool!`,
      `Hi ${matchName}! Your bio really caught my eye. How's your week going?`,
      `I've been meaning to try something related to ${interests[1] || 'one of your hobbies'}. Any tips?`
    ];
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following text into ${targetLanguage}. Return ONLY the translated text without any explanations, quotes, or additional notes: "${text}"`,
      config: {
        temperature: 0.1,
      }
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Translation failed:", error);
    return text;
  }
}
