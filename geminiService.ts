
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function retry<T>(fn: () => Promise<T>, retries = 2, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = error?.status === 503 || error?.status === 429 || error?.code === 503 || error?.code === 429;
    
    // Se for especificamente 429 (Quota Exceeded), aguardamos mais tempo
    const waitTime = error?.status === 429 || error?.code === 429 ? delay * 2 : delay;

    if (retries > 0 && isRetryable) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return retry(fn, retries - 1, waitTime * 1.5);
    }
    throw error;
  }
}

export async function getMotivationalSummary(stats: any) {
  try {
    const response = await retry(async () => {
      return await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analise estes dados recentes de uma gincana de Escola Sabatina: ${JSON.stringify(stats)}. 
        Gere uma mensagem curta, impactante e inspiradora (máximo 200 caracteres) em Português do Brasil para motivar os alunos no estudo diário e na missão.`,
        config: {
          systemInstruction: "Você é um mentor missionário breve e encorajador. Sua voz é inspiradora e cheia de fé.",
          temperature: 0.7,
        },
      });
    });
    
    return response.text || "O trabalho para o Senhor nunca é em vão. Que hoje sua unidade seja uma luz no caminho de alguém!";
  } catch (error: any) {
    // Tratamento silencioso de erros de quota para o usuário final
    if (error?.status === 429 || error?.code === 429) {
      console.log("Limite de quota atingido. Retornando mensagem padrão.");
    } else {
      console.error("Erro ao gerar motivação:", error);
    }
    return "A perseverança é a chave da vitória espiritual. Continue firme no estudo e na oração!";
  }
}
