import OpenAI from 'openai'
import type { ClientContext, ScriptLine } from '@/types/novum'
import {
  buildScriptSystemPrompt,
  buildVisionPrompt,
  buildFinalScriptPrompt,
} from './novum-prompts'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export type GenerateScriptResult = {
  vision: string
  script: ScriptLine[]
}

export async function generateScript(
  idea: string,
  clientCtx: ClientContext,
): Promise<GenerateScriptResult> {
  const systemPrompt = buildScriptSystemPrompt(clientCtx)

  // Paso 1: visión estratégica
  const visionRes = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 1500,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: buildVisionPrompt(idea) },
    ],
  })

  const vision = visionRes.choices[0]?.message?.content ?? ''

  // Paso 2: guion final en JSON
  const scriptRes = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 3000,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: buildFinalScriptPrompt(idea, vision) },
    ],
  })

  const rawText = scriptRes.choices[0]?.message?.content ?? '{"guion":[]}'
  const parsed = JSON.parse(rawText)
  // El modelo devuelve { guion: [...] } o directamente un array
  const script: ScriptLine[] = Array.isArray(parsed) ? parsed : (parsed.guion ?? parsed.script ?? [])

  return { vision, script }
}
