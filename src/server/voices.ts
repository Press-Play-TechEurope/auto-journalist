/**
 * Curated preset voices, grouped by TTS provider (all served through fal.ai).
 *
 * - ElevenLabs: ids are premade voice names, which fal's `voice` input accepts
 *   directly (it also takes a raw ElevenLabs `voice_id`, e.g. a cloned voice).
 *   Every ElevenLabs voice works on every ElevenLabs endpoint
 *   (multilingual-v2 / turbo-v2.5 / eleven-v3).
 * - MiniMax: ids are MiniMax system voice ids (speech-02-hd / speech-02-turbo).
 *
 * Voices are independent of presenters: any voice can be paired with any face.
 * Which set is offered is decided by the org's TTS model (see providerForModel).
 */
export const TTS_PROVIDERS = ["elevenlabs", "minimax"] as const;
export type TtsProvider = (typeof TTS_PROVIDERS)[number];

export const PROVIDER_LABEL: Record<TtsProvider, string> = {
  elevenlabs: "ElevenLabs",
  minimax: "MiniMax",
};

export const VOICES = [
  // ElevenLabs
  {
    id: "Brian",
    label: "Brian",
    gender: "male",
    description: "Deep, warm, authoritative narrator",
    provider: "elevenlabs",
  },
  {
    id: "Daniel",
    label: "Daniel",
    gender: "male",
    description: "Deep, steady British broadcaster",
    provider: "elevenlabs",
  },
  {
    id: "George",
    label: "George",
    gender: "male",
    description: "Warm British storyteller",
    provider: "elevenlabs",
  },
  {
    id: "Roger",
    label: "Roger",
    gender: "male",
    description: "Confident, laid-back American",
    provider: "elevenlabs",
  },
  {
    id: "Eric",
    label: "Eric",
    gender: "male",
    description: "Friendly, conversational",
    provider: "elevenlabs",
  },
  {
    id: "Liam",
    label: "Liam",
    gender: "male",
    description: "Young, energetic narrator",
    provider: "elevenlabs",
  },
  {
    id: "Rachel",
    label: "Rachel",
    gender: "female",
    description: "Calm, composed American newsreader",
    provider: "elevenlabs",
  },
  {
    id: "Sarah",
    label: "Sarah",
    gender: "female",
    description: "Soft, confident and clear",
    provider: "elevenlabs",
  },
  {
    id: "Alice",
    label: "Alice",
    gender: "female",
    description: "Clear, engaging British",
    provider: "elevenlabs",
  },
  {
    id: "Matilda",
    label: "Matilda",
    gender: "female",
    description: "Warm and friendly",
    provider: "elevenlabs",
  },
  {
    id: "Lily",
    label: "Lily",
    gender: "female",
    description: "Warm, velvety British",
    provider: "elevenlabs",
  },
  {
    id: "Aria",
    label: "Aria",
    gender: "female",
    description: "Expressive, mature American",
    provider: "elevenlabs",
  },
  {
    id: "River",
    label: "River",
    gender: "neutral",
    description: "Relaxed, neutral and informative",
    provider: "elevenlabs",
  },
  // MiniMax (legacy)
  {
    id: "Wise_Woman",
    label: "Wise Woman",
    gender: "female",
    description: "Measured, authoritative",
    provider: "minimax",
  },
  {
    id: "Calm_Woman",
    label: "Calm Woman",
    gender: "female",
    description: "Soft and steady",
    provider: "minimax",
  },
  {
    id: "Inspirational_girl",
    label: "Inspirational Girl",
    gender: "female",
    description: "Bright and uplifting",
    provider: "minimax",
  },
  {
    id: "Lively_Girl",
    label: "Lively Girl",
    gender: "female",
    description: "Energetic and upbeat",
    provider: "minimax",
  },
  {
    id: "Lovely_Girl",
    label: "Lovely Girl",
    gender: "female",
    description: "Light and friendly",
    provider: "minimax",
  },
  {
    id: "Friendly_Person",
    label: "Friendly Person",
    gender: "neutral",
    description: "Warm, approachable",
    provider: "minimax",
  },
  {
    id: "Deep_Voice_Man",
    label: "Deep Voice Man",
    gender: "male",
    description: "Deep, steady broadcaster",
    provider: "minimax",
  },
  {
    id: "Patient_Man",
    label: "Patient Man",
    gender: "male",
    description: "Calm and direct",
    provider: "minimax",
  },
  {
    id: "Determined_Man",
    label: "Determined Man",
    gender: "male",
    description: "Firm and confident",
    provider: "minimax",
  },
  {
    id: "Elegant_Man",
    label: "Elegant Man",
    gender: "male",
    description: "Polished, refined",
    provider: "minimax",
  },
  {
    id: "Casual_Guy",
    label: "Casual Guy",
    gender: "male",
    description: "Relaxed, conversational",
    provider: "minimax",
  },
  {
    id: "Imposing_Manner",
    label: "Imposing Manner",
    gender: "male",
    description: "Commanding, weighty",
    provider: "minimax",
  },
] as const;

export type Voice = (typeof VOICES)[number];
export type VoiceId = Voice["id"];

const DEFAULT_BY_PROVIDER: Record<TtsProvider, VoiceId> = {
  elevenlabs: "Brian",
  minimax: "Wise_Woman",
};

/** Map a fal TTS endpoint id to the provider whose voice set it uses. */
export function providerForModel(ttsModel: string): TtsProvider {
  if (ttsModel.startsWith("fal-ai/minimax/")) return "minimax";
  return "elevenlabs";
}

export function voicesFor(provider: TtsProvider): Voice[] {
  return VOICES.filter((v) => v.provider === provider);
}

export function defaultVoiceFor(provider: TtsProvider): VoiceId {
  return DEFAULT_BY_PROVIDER[provider];
}

/** True when `id` is a catalogue voice; narrows to `provider` when given. */
export function isVoiceId(id: string, provider?: TtsProvider): id is VoiceId {
  return VOICES.some(
    (v) => v.id === id && (provider === undefined || v.provider === provider),
  );
}

/** Resolve a voice for a model: keep it if valid for that provider, else the provider default. */
export function resolveVoiceFor(
  ttsModel: string,
  voiceId: string | null | undefined,
): VoiceId {
  const provider = providerForModel(ttsModel);
  return voiceId && isVoiceId(voiceId, provider)
    ? voiceId
    : defaultVoiceFor(provider);
}

export function voiceLabel(id: string) {
  return VOICES.find((v) => v.id === id)?.label ?? id;
}
