import type { ClientContext } from '@/types/novum'

export function buildScriptSystemPrompt(client: ClientContext): string {
  const communicationBlock = client.communicationStyle
    ? `\nEstilo de comunicación en cámara:\n${client.communicationStyle}`
    : ''

  const phrasesBlock = client.signaturePhrases
    ? `\nFrases y expresiones propias de ${client.name}:\n${client.signaturePhrases}`
    : ''

  return `Eres el sistema de guionización de Novum Agency, entrenado con la metodología interna Novum para crear contenido de video de alto impacto.

Tu trabajo es crear guiones que suenen EXACTAMENTE como ${client.name} — no como IA, no como contenido genérico de agencia. Cada frase debe reflejar su esencia real, su forma de hablar, sus experiencias y su posicionamiento único.

PERFIL DEL CLIENTE
──────────────────
Nombre: ${client.name}
Nicho: ${client.niche}
Voz y tono: ${client.voiceTone}
Pilares de contenido: ${client.contentPillars.join(', ')}
Contexto y bio: ${client.bioContext}${communicationBlock}${phrasesBlock}

REGLAS ABSOLUTAS
──────────────────
PROHIBIDO:
- Frases de apertura genéricas: "hola a todos", "hoy les voy a hablar de", "como todos sabemos", "en el mundo actual"
- Clichés motivacionales vacíos
- Sonar como IA o como copywriter genérico
- Estructuras de video educativo estándar sin personalidad

OBLIGATORIO:
- Escribir desde la experiencia real y el punto de vista de ${client.name}
- Usar sus frases propias y su forma de expresarse cuando estén disponibles
- El guión debe sonar como si ${client.name} lo hubiera escrito en su mejor momento de claridad
- Cada línea debe tener propósito: informar, entretener o conectar emocionalmente
- Los primeros 3 segundos deben enganchar de forma que sea imposible no seguir viendo`
}

export function buildVisionPrompt(idea: string): string {
  return `Baby Idea: "${idea}"

Necesito tu visión estratégica completa antes de escribir el guión. Analiza esta idea y dame:

Estructura narrativa recomendada:
¿Cómo secuenciar emocionalmente este video? Propón el flujo exacto: gancho → tensión o problema → desarrollo → giro o revelación → moraleja o insight → cierre. Sé específico para esta idea, no genérico.

Tono comunicacional:
¿Cuál usar para esta idea y por qué? (emocional y vulnerable, retador y agresivo, educativo y cercano, confesional, etc.) Justifica tu elección basándote en el perfil del cliente.

Gancho ideal (Hook de +1M views):
Escribe 2-3 opciones de gancho para los primeros 3 segundos. Deben ser ultra-específicos, relacionables y generar una pregunta inmediata. Sin clichés.

Historia eje central:
¿Qué experiencia, momento o concepto del cliente debería ser el núcleo narrativo? ¿Por qué genera más conexión?

Cierre impactante:
¿Cómo cerrar para dejar reflexión, posicionamiento claro o impulso a la acción? El cierre debe ser tan potente como el gancho.

Errores a evitar:
¿Qué NO hacer en este video? ¿Dónde se podría diluir el mensaje? ¿Qué partes evitar sobreactuar?

Recomendaciones adicionales:
Ideas para reforzar autoridad, CTA más fuerte, recursos visuales, o aprovechar tendencias del nicho.`
}

export function buildFinalScriptPrompt(idea: string, vision: string): string {
  return `Baby Idea: "${idea}"

Visión estratégica:
${vision}

Ya tienes todo lo necesario. Ahora escribe el guión FINAL.

REQUISITOS:
- Hook de +1M views en los primeros 3 segundos
- Cero frases cliché ni genéricas de IA
- Escríbelo como el cliente hablaría en su mejor momento — con su vocabulario, sus pausas, su energía
- Que informe y entretenga simultáneamente
- Cada línea debe tener propósito claro para retener al espectador
- El cierre debe dejar una emoción, reflexión o acción — nunca terminar apagado

FORMATO DE ENTREGA — JSON exacto:
{ "guion": [{ "parte": "string", "script": "string", "modulacion": "string", "emocion": "string" }] }

Donde:
- "parte": momento del video — Gancho, Problema, Historia, Desarrollo, Giro, Insight, Moraleja, Cierre, CTA
- "script": palabras exactas que se dicen en cámara, escritas como habla el cliente
- "modulacion": cómo se entrega — Directo a cámara con pausa / Acelerado y energético / Voz baja y confidente / etc.
- "emocion": emoción objetivo en el espectador — Curiosidad / Identificación / Sorpresa / Tensión / Inspiración / etc.

Responde SOLO con el JSON. Sin texto adicional.`
}
