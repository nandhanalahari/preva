import OpenAI from "openai"

const FEATHERLESS_BASE_URL = "https://api.featherless.ai/v1"

/**
 * Ordered fallback chains — if the first model is unavailable (503/429),
 * the next one in the list is tried automatically.
 */
export const CLINICAL_MODELS = [
  "Cannae-AI/MedicalQwen3-Reasoning-14B-IT",
  "Intelligent-Internet/II-Medical-8B",
  "m42-health/Llama3-Med42-8B",
  "johnsnowlabs/JSL-MedLlama-3-8B-v2.0",
]

export const BIO_MODELS = [
  "BioMistral/BioMistral-7B-DARE",
  "microsoft/MediPhi-Instruct",
  "Intelligent-Internet/II-Medical-8B",
]

export const MODEL_CLINICAL = CLINICAL_MODELS[0]
export const MODEL_BIO = BIO_MODELS[0]

export function getFeatherlessClient(): OpenAI | null {
  const apiKey = process.env.FEATHERLESS_API_KEY
  if (!apiKey) return null
  return new OpenAI({
    baseURL: FEATHERLESS_BASE_URL,
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": "https://preva.app",
      "X-Title": "Preva Home Health",
    },
  })
}

type ChatParams = Omit<
  Parameters<OpenAI["chat"]["completions"]["create"]>[0],
  "model"
>

/**
 * Calls chat completions with automatic model fallback.
 * Tries each model in the chain until one succeeds.
 */
export async function chatWithFallback(
  client: OpenAI,
  models: string[],
  params: ChatParams
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  let lastError: Error | null = null
  for (const model of models) {
    try {
      return await client.chat.completions.create({ ...params, model })
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err))
      const status =
        (err as { status?: number }).status ??
        (err as { response?: { status?: number } }).response?.status
      if (status === 503 || status === 429) {
        continue
      }
      throw lastError
    }
  }
  throw lastError ?? new Error("All models unavailable")
}

export function parseJsonFromResponse(raw: string): unknown {
  let jsonStr = raw.trim()
  const codeMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeMatch) jsonStr = codeMatch[1].trim()
  jsonStr = jsonStr.replace(/,(\s*[}\]])/g, "$1")
  return JSON.parse(jsonStr)
}
