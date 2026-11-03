import Repository from '@/lib/Repository';

// Todo o som é sintetizado com a Web Audio API: nenhum arquivo para baixar nem
// licença de áudio para cuidar.

export type SoundEffect =
  | 'select'
  | 'deselect'
  | 'confirm'
  | 'vote'
  | 'tick'
  | 'reveal'
  | 'round'
  | 'message'
  | 'win'
  | 'lose';

export interface SoundSettings {
  music: boolean;
  effects: boolean;
}

interface ToneOptions {
  frequency: number;
  start: number;
  duration: number;
  volume: number;
  type?: OscillatorType;
  slideTo?: number;
}

interface NoiseOptions {
  start: number;
  duration: number;
  volume: number;
  filter: number;
  filterTo?: number;
}

const SETTINGS_KEY = '@CARDS_AGAINST_HUMANITY/SOUND';

const EFFECTS_VOLUME = 0.7;
const MUSIC_VOLUME = 0.32;

const BPM = 96;
const STEP = 60 / BPM / 2;
const SWING = STEP * 0.3;
const LOOP_STEPS = 64;
const LOOK_AHEAD = 1;
const SCHEDULER_INTERVAL = 250;

// Oito compassos em lá menor, um jazz de lounge meio debochado.
const CHORDS = [
  [57, 60, 64, 67],
  [57, 60, 62, 65],
  [55, 59, 62, 65],
  [55, 59, 60, 64],
  [57, 60, 64, 65],
  [57, 59, 62, 65],
  [56, 59, 62, 64],
  [57, 60, 64, 66],
];

const BASS = [
  [33, 40, 45, 43],
  [38, 45, 41, 40],
  [43, 38, 41, 42],
  [36, 43, 40, 38],
  [41, 45, 48, 47],
  [47, 41, 45, 44],
  [40, 44, 47, 38],
  [33, 40, 43, 44],
];

// [passo, nota, duração em passos]
const MELODY = [
  [0, 76, 2],
  [3, 79, 1],
  [4, 76, 1],
  [6, 72, 2],
  [8, 77, 3],
  [12, 74, 2],
  [16, 79, 2],
  [19, 77, 1],
  [20, 74, 1],
  [22, 71, 2],
  [24, 72, 4],
  [32, 72, 2],
  [35, 76, 1],
  [36, 79, 2],
  [38, 81, 1],
  [40, 77, 3],
  [44, 74, 2],
  [48, 76, 2],
  [50, 80, 1],
  [51, 83, 1],
  [52, 80, 1],
  [54, 74, 2],
  [56, 76, 4],
  [62, 71, 1],
  [63, 72, 1],
];

let settings: SoundSettings = {
  music: true,
  effects: true,
  ...Repository.get<SoundSettings>(SETTINGS_KEY),
};

let context: AudioContext | null = null;
let output: AudioNode | null = null;
let effectsBus: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

let hasUserGesture = false;

let musicWanted = false;
let musicBus: GainNode | null = null;
let musicTimer: ReturnType<typeof setInterval> | null = null;
let nextStep = 0;
let nextStepTime = 0;

function midiToFrequency(note: number): number {
  return 440 * 2 ** ((note - 69) / 12);
}

function getContext(): AudioContext | null {
  if (context) {
    return context;
  }

  if (typeof AudioContext === 'undefined') {
    return null;
  }

  context = new AudioContext();

  const limiter = context.createDynamicsCompressor();

  limiter.connect(context.destination);
  output = limiter;

  effectsBus = context.createGain();
  effectsBus.gain.value = EFFECTS_VOLUME;
  effectsBus.connect(limiter);

  return context;
}

function getNoiseBuffer(audio: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    noiseBuffer = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);

    const data = noiseBuffer.getChannelData(0);

    for (let i = 0; i < data.length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  return noiseBuffer;
}

function playTone(
  audio: AudioContext,
  destination: AudioNode,
  { frequency, start, duration, volume, type = 'sine', slideTo }: ToneOptions
): void {
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);

  if (slideTo) {
    oscillator.frequency.exponentialRampToValueAtTime(
      slideTo,
      start + duration
    );
  }

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(destination);

  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playNoise(
  audio: AudioContext,
  destination: AudioNode,
  { start, duration, volume, filter, filterTo }: NoiseOptions
): void {
  const source = audio.createBufferSource();
  const bandpass = audio.createBiquadFilter();
  const gain = audio.createGain();

  source.buffer = getNoiseBuffer(audio);

  bandpass.type = 'bandpass';
  bandpass.frequency.setValueAtTime(filter, start);

  if (filterTo) {
    bandpass.frequency.exponentialRampToValueAtTime(filterTo, start + duration);
  }

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  source.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(destination);

  source.start(start, Math.random() * 0.5, duration + 0.02);
}

export function playEffect(effect: SoundEffect): void {
  // Antes do primeiro gesto o áudio está suspenso, e tudo que fosse agendado
  // tocaria de uma vez quando ele fosse liberado.
  if (!settings.effects || !hasUserGesture) {
    return;
  }

  const audio = getContext();

  if (!audio || !effectsBus) {
    return;
  }

  const bus = effectsBus;
  const now = audio.currentTime + 0.01;

  function note(
    midi: number,
    delay: number,
    duration: number,
    volume: number,
    type: OscillatorType = 'triangle'
  ): void {
    playTone(audio!, bus, {
      frequency: midiToFrequency(midi),
      start: now + delay,
      duration,
      volume,
      type,
    });
  }

  switch (effect) {
    case 'select':
      playNoise(audio, bus, {
        start: now,
        duration: 0.05,
        volume: 0.12,
        filter: 2400,
      });
      note(76, 0, 0.07, 0.16);
      note(81, 0.04, 0.09, 0.16);
      break;
    case 'deselect':
      note(76, 0, 0.07, 0.12);
      note(71, 0.04, 0.09, 0.12);
      break;
    case 'confirm':
      playNoise(audio, bus, {
        start: now,
        duration: 0.14,
        volume: 0.22,
        filter: 900,
        filterTo: 3800,
      });
      note(72, 0.05, 0.12, 0.2);
      note(79, 0.13, 0.2, 0.2);
      break;
    case 'vote':
      note(79, 0, 0.14, 0.18, 'sine');
      note(84, 0.08, 0.14, 0.18, 'sine');
      note(91, 0.16, 0.35, 0.18, 'sine');
      break;
    case 'tick':
      playNoise(audio, bus, {
        start: now,
        duration: 0.05,
        volume: 0.14,
        filter: 1600,
      });
      note(64, 0, 0.06, 0.08, 'sine');
      break;
    case 'reveal':
      [69, 72, 76, 81, 84].forEach((midi, index) => {
        note(midi, index * 0.09, 0.22, 0.14);
      });
      break;
    case 'round':
      playNoise(audio, bus, {
        start: now,
        duration: 0.3,
        volume: 0.2,
        filter: 500,
        filterTo: 4200,
      });
      [69, 72, 76].forEach((midi, index) => {
        note(midi, 0.12 + index * 0.08, 0.3, 0.14);
      });
      break;
    case 'message':
      note(81, 0, 0.08, 0.1, 'sine');
      note(88, 0.07, 0.14, 0.1, 'sine');
      break;
    case 'win':
      [60, 64, 67, 72].forEach((midi, index) => {
        note(midi, index * 0.13, 0.22, 0.2, 'square');
      });
      [72, 76, 79, 84].forEach((midi) => {
        note(midi, 0.55, 0.9, 0.12, 'square');
      });
      break;
    case 'lose':
      // O trombone triste de quem ficou no quase.
      [
        [63, 0, 0.26],
        [62, 0.3, 0.26],
        [61, 0.6, 0.26],
      ].forEach(([midi, delay, duration]) => {
        note(midi, delay, duration, 0.16, 'sawtooth');
      });
      playTone(audio, bus, {
        frequency: midiToFrequency(60),
        slideTo: midiToFrequency(57),
        start: now + 0.9,
        duration: 0.9,
        volume: 0.16,
        type: 'sawtooth',
      });
      break;
    default:
  }
}

function scheduleStep(audio: AudioContext, bus: GainNode, step: number): void {
  const bar = Math.floor(step / 8);
  const beatStep = step % 8;
  const swung = beatStep % 2 === 1 ? SWING : 0;
  const start = nextStepTime + swung;

  if (beatStep % 2 === 0) {
    playTone(audio, bus, {
      frequency: midiToFrequency(BASS[bar][beatStep / 2]),
      start,
      duration: STEP * 1.8,
      volume: 0.34,
      type: 'triangle',
    });

    playNoise(audio, bus, {
      start,
      duration: 0.04,
      volume: 0.025,
      filter: 7000,
    });
  }

  if (beatStep === 3 || beatStep === 6) {
    CHORDS[bar].forEach((midi) => {
      playTone(audio, bus, {
        frequency: midiToFrequency(midi),
        start,
        duration: STEP * 1.6,
        volume: 0.07,
      });
    });
  }

  MELODY.filter(([melodyStep]) => melodyStep === step).forEach(
    ([, midi, length]) => {
      playTone(audio, bus, {
        frequency: midiToFrequency(midi),
        start,
        duration: STEP * length * 1.3,
        volume: 0.12,
      });
    }
  );
}

function scheduleMusic(): void {
  if (!context || !musicBus) {
    return;
  }

  // Depois de um tempo suspenso, retoma do presente em vez de correr atrás.
  if (nextStepTime < context.currentTime) {
    nextStepTime = context.currentTime + 0.05;
  }

  while (nextStepTime < context.currentTime + LOOK_AHEAD) {
    scheduleStep(context, musicBus, nextStep);

    nextStep = (nextStep + 1) % LOOP_STEPS;
    nextStepTime += STEP;
  }
}

function startScheduler(): void {
  if (musicTimer || !musicWanted || !settings.music || !hasUserGesture) {
    return;
  }

  const audio = getContext();

  if (!audio || !output) {
    return;
  }

  musicBus = audio.createGain();
  musicBus.gain.setValueAtTime(0.0001, audio.currentTime);
  musicBus.gain.exponentialRampToValueAtTime(
    MUSIC_VOLUME,
    audio.currentTime + 1
  );
  musicBus.connect(output);

  nextStep = 0;
  nextStepTime = audio.currentTime + 0.1;

  scheduleMusic();

  musicTimer = setInterval(scheduleMusic, SCHEDULER_INTERVAL);
}

function stopScheduler(): void {
  if (musicTimer) {
    clearInterval(musicTimer);
    musicTimer = null;
  }

  if (context && musicBus) {
    const bus = musicBus;
    const fadeEnd = context.currentTime + 0.3;

    bus.gain.cancelScheduledValues(context.currentTime);
    bus.gain.setValueAtTime(bus.gain.value || 0.0001, context.currentTime);
    bus.gain.exponentialRampToValueAtTime(0.0001, fadeEnd);

    // As notas já agendadas morrem junto com o barramento.
    setTimeout(() => bus.disconnect(), 400);
  }

  musicBus = null;
}

export function startMusic(): void {
  musicWanted = true;
  startScheduler();
}

export function stopMusic(): void {
  musicWanted = false;
  stopScheduler();
}

export function getSoundSettings(): SoundSettings {
  return settings;
}

export function changeSoundSettings(newSettings: SoundSettings): void {
  settings = newSettings;

  Repository.save(SETTINGS_KEY, settings);

  if (settings.music) {
    startScheduler();
  } else {
    stopScheduler();
  }
}

// O navegador só libera o áudio depois de um gesto do jogador.
function handleUserGesture(): void {
  hasUserGesture = true;

  const audio = getContext();

  if (audio?.state === 'suspended') {
    audio.resume();
  }

  startScheduler();
}

['pointerdown', 'pointerup', 'touchend', 'keydown'].forEach((eventName) => {
  window.addEventListener(eventName, handleUserGesture, { capture: true });
});
