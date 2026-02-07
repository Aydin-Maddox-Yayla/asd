
import { GoogleGenAI, Type } from "@google/genai";
import { BotConfig } from "../types";

export const generateBotCode = async (config: BotConfig): Promise<{ code: string; readme: string; packageJson: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Erstelle den vollständigen, produktionsreifen Quellcode für einen ${config.platform} Bot namens "${config.name}".
    Sprache: ${config.language}
    
    Bot-Konzept:
    - Persönlichkeit: ${config.personality} (Der Bot soll in diesem Stil antworten).
    - Interaktionsstil: ${config.interactionStyle}
    
    Haupt-Features & Aufgaben:
    ${config.features}
    
    Befehlsliste (Commands):
    ${config.commands.map(cmd => `- ${cmd.trigger}: ${cmd.description} (Logik: ${cmd.action})`).join('\n')}
    
    Anforderungen:
    1. Implementiere alle genannten Commands.
    2. Der Code muss sauber kommentiert sein.
    3. Nutze moderne Libraries (z.B. discord.js v14 für Discord, telegraf für Telegram).
    4. Berücksichtige die gewünschte Persönlichkeit "${config.personality}" in den vordefinierten Textantworten.
    
    Bitte gib das Ergebnis als JSON-Objekt mit den Schlüsseln "code", "readme" und "packageJson" zurück. 
    Das "code"-Feld enthält die Hauptdatei (index.js, main.py, etc.). 
    Das "readme"-Feld enthält eine Schritt-für-Schritt Anleitung zur Einrichtung (inkl. Hosting-Tipps für Glitch/Replit).
    Das "packageJson"-Feld enthält die package.json (für JS/TS) oder requirements.txt (für Python).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          code: { type: Type.STRING, description: "Der Haupt-Quellcode des Bots" },
          readme: { type: Type.STRING, description: "Eine Markdown-Anleitung für den Bot" },
          packageJson: { type: Type.STRING, description: "Abhängigkeiten (package.json oder requirements.txt)" }
        },
        required: ["code", "readme", "packageJson"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Fehler beim Parsen der KI-Antwort:", error);
    throw new Error("Konnte den Code nicht generieren. Bitte versuche es mit einer detaillierteren Beschreibung.");
  }
};
