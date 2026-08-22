/**
 * veed/subtitles presets the org can choose from. Each preset bundles fonts,
 * colors, layout, and animation. Dynamic presets cost 2x the base rate;
 * basic presets are 1x. Order = dropdown order (basic first for value).
 * Source of truth: https://fal.ai/models/veed/subtitles
 */
export const SUBTITLE_PRESETS = [
  // Basic (1x multiplier)
  { value: "casper", label: "Casper", tier: "basic" },
  { value: "plain", label: "Plain", tier: "basic" },
  { value: "simple", label: "Simple", tier: "basic" },
  { value: "lowkey", label: "Lowkey", tier: "basic" },
  { value: "sprout", label: "Sprout", tier: "basic" },
  { value: "mint", label: "Mint", tier: "basic" },
  { value: "vegas", label: "Vegas", tier: "basic" },
  { value: "capri", label: "Capri", tier: "basic" },
  { value: "shadeplay", label: "Shadeplay", tier: "basic" },
  { value: "beans", label: "Beans", tier: "basic" },
  { value: "corpo", label: "Corpo", tier: "basic" },
  { value: "boo", label: "Boo", tier: "basic" },
  { value: "vinta", label: "Vinta", tier: "basic" },
  { value: "diego", label: "Diego", tier: "basic" },
  { value: "ali", label: "Ali", tier: "basic" },
  { value: "slay", label: "Slay", tier: "basic" },
  { value: "kitty", label: "Kitty", tier: "basic" },
  { value: "hustle", label: "Hustle", tier: "basic" },
  { value: "karl", label: "Karl", tier: "basic" },
  { value: "flex", label: "Flex", tier: "basic" },
  { value: "rizz", label: "Rizz", tier: "basic" },
  // Dynamic (2x multiplier — richer, context-aware rendering)
  { value: "glass", label: "Glass", tier: "dynamic" },
  { value: "whisper", label: "Whisper", tier: "dynamic" },
  { value: "glide", label: "Glide", tier: "dynamic" },
  { value: "glide2", label: "Glide 2", tier: "dynamic" },
  { value: "fusion", label: "Fusion", tier: "dynamic" },
  { value: "terminal", label: "Terminal", tier: "dynamic" },
  { value: "handwritten", label: "Handwritten", tier: "dynamic" },
  { value: "backdrop", label: "Backdrop", tier: "dynamic" },
  { value: "backdrop2", label: "Backdrop 2", tier: "dynamic" },
] as const;

export type SubtitlePreset = (typeof SUBTITLE_PRESETS)[number]["value"];
export const SUBTITLE_PRESET_VALUES = SUBTITLE_PRESETS.map((p) => p.value) as [
  SubtitlePreset,
  ...SubtitlePreset[],
];
export const DEFAULT_SUBTITLE_PRESET: SubtitlePreset = "casper";

export function isSubtitlePreset(value: string): value is SubtitlePreset {
  return (SUBTITLE_PRESET_VALUES as readonly string[]).includes(value);
}