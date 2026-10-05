# Ideapad Effects Pro 2025 (v25.1.0)
### Professional Non-Linear Video Editor & Compositor (Adobe Premiere Pro 2025 Edition)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FVAISHNAV-IDEAPAD%2Fideapadeffectspro&project-name=ideapadeffectspro&repository-name=ideapadeffectspro)
[![GitHub stars](https://img.shields.io/github/stars/VAISHNAV-IDEAPAD/ideapadeffectspro?style=social)](https://github.com/VAISHNAV-IDEAPAD/ideapadeffectspro)
[![Version](https://img.shields.io/badge/version-25.1.0-blue.svg)](https://github.com/VAISHNAV-IDEAPAD/ideapadeffectspro)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**Ideapad Effects Pro** is an open-source, high-performance web/desktop video editing and compositing workstation modeled directly after **Adobe Premiere Pro 2025 (v25.x)**.

---

## 🚀 One-Click Vercel Deployment

Deploy directly to your Vercel account with the domain **`ideapadeffectspro.vercel.app`**:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FVAISHNAV-IDEAPAD%2Fideapadeffectspro&project-name=ideapadeffectspro&repository-name=ideapadeffectspro)

1. Click the **Deploy with Vercel** button above.
2. Sign in to your Vercel account.
3. Keep the project name as **`ideapadeffectspro`**.
4. Click **Deploy** — your live editor will be instantly live at **`https://ideapadeffectspro.vercel.app`**!

---

## 🎬 Key Features

### 1. Adobe Premiere Pro 2025 Spectrum Interface
- **Workspace Switcher**: Instant switching between **Editing**, **Lumetri Color**, **Effects**, **Audio**, **Captions & Graphics**, and **Export**.
- **4-Quadrant Docking System**:
  - **Top-Left**: Source Monitor, Effect Controls, Lumetri Color, Scopes, and Audio Track Mixer.
  - **Top-Right**: Program Monitor with live canvas playback, safe margins, aspect-ratio switching (16:9, 9:16 Reels/TikTok, 1:1 Square, 4K), and snapshot camera.
  - **Bottom-Left**: Project Media Bin (drag-and-drop file import, search filter) & Transitions Library.
  - **Center Toolbar**: Classic vertical tool palette: Selection (`V`), Track Select (`A`), Ripple Edit (`B`), Razor (`C`), Slip (`Y`), Hand (`H`), Type (`T`).
  - **Bottom-Right**: Multi-Track Timeline (V1–V3 video layers, A1–A2 audio layers, magnetic snapping, trimming handles, playhead needle).
  - **Far-Right**: Dynamic dual-channel Master Audio VU Peak Meter (-60 dB to 0 dB with green/yellow/red gradient segments and live dB readings).

### 2. Multi-Track Canvas Compositing Engine
- 60 FPS layered video rendering with blend modes (Normal, Screen, Multiply, Overlay, Darken, Lighten, Difference).
- Direct-manipulation canvas transform gizmo (drag directly on preview screen to position X/Y).
- Built-in transitions: Cross Dissolve, Dip to Black, Dip to White, Slide Up.
- Pre-bundled procedural video generators and stock assets for immediate out-of-the-box editing.

### 3. Lumetri Color Grading Suite
- White balance (Temperature & Tint) and Tone (Exposure EV, Contrast, Saturation).
- Creative Look LUT presets: **Cyberpunk Teal & Orange**, **Kodak 2383 Film**, **Vintage Warm**, **Noir B&W**, and **Bleach Bypass**.
- Real-time RGB Waveform Scopes.

### 4. Essential Graphics (Titling)
- Professional typography controls: font family, font size, font weight, text alignment, outline stroke, drop shadow, and background box.
- Motion presets: Cinematic Fade In, Typewriter, Slide Up, Lower Third.

### 5. Audio Engine & Track Mixer
- Web Audio API graph with master volume, track faders, stereo pan, mute (`M`), and solo (`S`).
- Backing track synthesis synchronized with timeline playback.

### 6. Video Export Engine
- Canvas capture stream and audio destination encoding to `.webm` / `.mp4`.
- Presets: YouTube 1080p Full HD, 4K UHD, Social Reels 9:16 Vertical, and 720p Fast Preview.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play / Pause sequence |
| `J` / `K` / `L` | Shuttle Reverse / Pause / Fast Forward |
| `Left` / `Right` | Step backward / forward 1 frame |
| `Shift + Left/Right` | Step backward / forward 5 frames |
| `C` | Razor tool (click clip to cut) |
| `Ctrl + K` | Razor cut all tracks at playhead |
| `V` | Selection tool |
| `T` | Type tool (new text title graphic) |
| `I` / `O` | Mark In / Out points |
| `S` | Toggle magnetic snapping |
| `+` / `-` | Zoom in / out timeline |
| `Ctrl + M` | Open Export Sequence modal |
| `Ctrl + Z` / `Ctrl + Y` | Undo / Redo |

---

## 🛠️ Local Development

```bash
# Clone the repository
git clone https://github.com/VAISHNAV-IDEAPAD/ideapadeffectspro.git
cd ideapadeffectspro

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📄 License
MIT License. Crafted with precision for high-performance creative video editing.
