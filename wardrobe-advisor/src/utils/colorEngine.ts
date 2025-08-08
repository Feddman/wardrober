export type Formality = 'casual' | 'smart' | 'formal';

export type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'neutrals';

export type Suggestion = {
  title: string;
  details: string;
  colors: string[];
};

export type ColorEngineInput = {
  baseColors: string[]; // hex colors like #112233
  formality: Formality;
  preferredMetal?: 'gold' | 'silver' | 'both';
};

export type ColorEngineOutput = {
  palette: Record<HarmonyType, string[]>;
  suggestions: Suggestion[];
};

function clamp255(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((v) => clamp255(v).toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase();
}

function rotateHue(rgb: { r: number; g: number; b: number }, degrees: number): string {
  // Convert to HSL, rotate hue, back to RGB
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  h = (h + degrees / 360) % 1;
  if (h < 0) h += 1;

  function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  let r2: number, g2: number, b2: number;
  if (s === 0) {
    r2 = g2 = b2 = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r2 = hue2rgb(p, q, h + 1 / 3);
    g2 = hue2rgb(p, q, h);
    b2 = hue2rgb(p, q, h - 1 / 3);
  }

  return rgbToHex(r2 * 255, g2 * 255, b2 * 255);
}

function complementary(hex: string): string {
  return rotateHue(hexToRgb(hex), 180);
}

function analogous(hex: string): string[] {
  const rgb = hexToRgb(hex);
  return [rotateHue(rgb, -30), hex.toUpperCase(), rotateHue(rgb, 30)];
}

function triadic(hex: string): string[] {
  const rgb = hexToRgb(hex);
  return [hex.toUpperCase(), rotateHue(rgb, 120), rotateHue(rgb, -120)];
}

const SAFE_NEUTRALS = ['#000000', '#1F2937', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#FFFFFF', '#1F2A44', '#C2B280'];

function buildNeutrals(base: string[]): string[] {
  // Return a small set of safe neutrals with slight bias based on base brightness
  const primary = base[0] ?? '#2D3748';
  const { r, g, b } = hexToRgb(primary);
  const lightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255; // perceived brightness
  if (lightness > 0.6) {
    return ['#000000', '#374151', '#6B7280', '#9CA3AF'];
  }
  return ['#FFFFFF', '#D1D5DB', '#9CA3AF', '#6B7280'];
}

export function generateColorPlan(input: ColorEngineInput): ColorEngineOutput {
  const base = input.baseColors.length > 0 ? input.baseColors : ['#1F2937'];
  const main = base[0];

  const palette: Record<HarmonyType, string[]> = {
    complementary: [main, complementary(main)],
    analogous: analogous(main),
    triadic: triadic(main),
    neutrals: buildNeutrals(base),
  };

  const tone = input.preferredMetal ?? 'both';
  const metalPhrase = tone === 'both' ? 'gold or silver' : tone;
  const formality = input.formality;

  const suggestions: Suggestion[] = [];

  // Accessory suggestion based on tone and contrast
  const compContrast = 1; // placeholder for contrast logic
  suggestions.push({
    title: 'Accessory',
    details: `${formality === 'formal' ? 'Keep it refined' : formality === 'smart' ? 'Elevate the look' : 'Add personality'} with ${metalPhrase} accents. Try a ${formality === 'formal' ? 'minimal' : compContrast > 0.8 ? 'subtle' : 'statement'} piece.`,
    colors: [palette.neutrals[0], palette.neutrals[1]],
  });

  // Color pairing suggestions
  suggestions.push({
    title: 'Complementary pop',
    details: `Add a pop via complementary color: ${palette.complementary[1]}. Good for bags, scarves, or shoes.`,
    colors: palette.complementary,
  });

  suggestions.push({
    title: 'Analogous blend',
    details: 'Create a cohesive look with close-by hues (jacket/shirt/accessory).',
    colors: palette.analogous,
  });

  suggestions.push({
    title: 'Triadic contrast',
    details: 'Balanced contrast using three-way split. Use one as an accent.',
    colors: palette.triadic,
  });

  suggestions.push({
    title: 'Safe neutrals',
    details: 'If in doubt, pair with these reliable neutrals.',
    colors: palette.neutrals,
  });

  return { palette, suggestions };
}