export interface LumetriBasicCorrection {
  temperature: number; // -100 to 100
  tint: number;        // -100 to 100
  exposure: number;    // -5 to 5
  contrast: number;    // -100 to 100
  highlights: number;  // -100 to 100
  shadows: number;     // -100 to 100
  whites: number;      // -100 to 100
  blacks: number;      // -100 to 100
  saturation: number;  // 0 to 200 (100 is neutral)
}

export type LumetriLookPreset = 
  | 'none'
  | 'teal_orange'
  | 'kodak_2383'
  | 'vintage_film'
  | 'noir_bw'
  | 'bleach_bypass'
  | 'vibrant_pop'
  | 'cyberpunk'
  | 'warm_golden';

export interface LumetriCreative {
  look: LumetriLookPreset;
  intensity: number;   // 0 to 100
  fadedFilm: number;   // 0 to 100
  sharpen: number;     // 0 to 100
  vibrance: number;    // -100 to 100
}

export interface ColorWheelTint {
  hue: number;         // 0 to 360
  saturation: number;  // 0 to 100
  luminance: number;   // -100 to 100
}

export interface LumetriColorWheels {
  shadows: ColorWheelTint;
  midtones: ColorWheelTint;
  highlights: ColorWheelTint;
}

export interface LumetriVignette {
  amount: number;      // -100 to 100
  feather: number;     // 0 to 100
}

export interface LumetriSettings {
  enabled: boolean;
  basic: LumetriBasicCorrection;
  creative: LumetriCreative;
  wheels: LumetriColorWheels;
  vignette: LumetriVignette;
}

export const defaultLumetriSettings: LumetriSettings = {
  enabled: true,
  basic: {
    temperature: 0,
    tint: 0,
    exposure: 0,
    contrast: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    saturation: 100,
  },
  creative: {
    look: 'none',
    intensity: 100,
    fadedFilm: 0,
    sharpen: 0,
    vibrance: 0,
  },
  wheels: {
    shadows: { hue: 0, saturation: 0, luminance: 0 },
    midtones: { hue: 0, saturation: 0, luminance: 0 },
    highlights: { hue: 0, saturation: 0, luminance: 0 },
  },
  vignette: {
    amount: 0,
    feather: 50,
  },
};
