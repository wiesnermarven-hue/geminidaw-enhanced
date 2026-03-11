import { create } from 'zustand';
import { samplePacks } from './modules/samplePacks';

export interface Step {
  isActive: boolean;
}

type ChannelUpdater = (channel: Channel) => Channel;

export const DEFAULT_PATTERN_LENGTH = 16;
export const PATTERN_LENGTH_OPTIONS = [16, 32, 64] as const;
export const PROJECT_STORAGE_KEY = 'geminiDAW_project';
export const MASTER_INSERT_ID = 'master';
const DEFAULT_SEND_SLOTS = 2;
const DEFAULT_FX_SLOTS = 4;

export type SynthType = '808 Kick' | '808 Snare' | '808 Closed Hat' | '808 Open Hat' | '808 Clap' | '808 Cowbell' | 'Synth' | 'FM Lead';

export const drumSynths: SynthType[] = ['808 Kick', '808 Snare', '808 Closed Hat', '808 Open Hat', '808 Clap', '808 Cowbell'];
export const melodicSynths: SynthType[] = ['Synth', 'FM Lead'];
export const allSynths: SynthType[] = [...drumSynths, ...melodicSynths];

export const defaultPresets: Record<SynthType, Record<string, any>> = {
  '808 Kick': {
    Default: { pitchDecay: 0.05, octaves: 4, oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: 'exponential' } },
    Punchy: { pitchDecay: 0.1, octaves: 6, oscillator: { type: 'square' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.5, attackCurve: 'exponential' } },
    'Long 808': { pitchDecay: 0.02, octaves: 3, oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 1.5, sustain: 0.1, release: 2, attackCurve: 'linear' } },
    Club: { pitchDecay: 0.08, octaves: 5, oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.65 } },
    Thump: { pitchDecay: 0.04, octaves: 7, oscillator: { type: 'triangle' }, envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.35 } },
    Soft: { pitchDecay: 0.03, octaves: 3, oscillator: { type: 'sine' }, envelope: { attack: 0.003, decay: 0.52, sustain: 0.02, release: 0.9 } },
  },
  '808 Snare': {
    Default: { noise: { type: 'pink' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 } },
    Tight: { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 } },
    Splashy: { noise: { type: 'brown' }, envelope: { attack: 0.005, decay: 0.4, sustain: 0.1, release: 0.4 } },
    Dusty: { noise: { type: 'pink' }, envelope: { attack: 0.002, decay: 0.24, sustain: 0.02, release: 0.18 } },
    Bright: { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.16, sustain: 0, release: 0.12 } },
    Arena: { noise: { type: 'brown' }, envelope: { attack: 0.003, decay: 0.5, sustain: 0.08, release: 0.35 } },
  },
  '808 Closed Hat': {
    Default: { frequency: 200, envelope: { attack: 0.001, decay: 0.1, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 },
    Tight: { frequency: 300, envelope: { attack: 0.001, decay: 0.05, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 },
    Crisp: { frequency: 260, envelope: { attack: 0.001, decay: 0.08, release: 0.01 }, harmonicity: 6.3, modulationIndex: 28, resonance: 4600, octaves: 1.7 },
    Airy: { frequency: 420, envelope: { attack: 0.001, decay: 0.06, release: 0.02 }, harmonicity: 7.1, modulationIndex: 18, resonance: 5200, octaves: 1.2 },
  },
  '808 Open Hat': {
    Default: { frequency: 200, envelope: { attack: 0.001, decay: 0.5, release: 0.1 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 },
    Long: { frequency: 200, envelope: { attack: 0.001, decay: 0.8, release: 0.2 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 },
    Shimmer: { frequency: 230, envelope: { attack: 0.001, decay: 0.65, release: 0.14 }, harmonicity: 6.8, modulationIndex: 22, resonance: 5400, octaves: 1.2 },
    Wash: { frequency: 180, envelope: { attack: 0.002, decay: 1.1, release: 0.28 }, harmonicity: 5.8, modulationIndex: 18, resonance: 3600, octaves: 1.8 },
  },
  '808 Clap': {
    Default: { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 } },
    Short: { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 } },
    Wide: { noise: { type: 'pink' }, envelope: { attack: 0.002, decay: 0.34, sustain: 0.02, release: 0.16 } },
    Snap: { noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.11, sustain: 0, release: 0.08 } },
  },
  '808 Cowbell': {
    Default: { oscillator: { type: 'square' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.1 } },
    Muted: { oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 } },
    Ring: { oscillator: { type: 'triangle' }, envelope: { attack: 0.001, decay: 0.24, sustain: 0.02, release: 0.14 } },
    Bellish: { oscillator: { type: 'fmsquare' }, envelope: { attack: 0.001, decay: 0.16, sustain: 0.01, release: 0.18 } },
  },
  Synth: {
    Default: { oscillator: { type: 'square' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.5 } },
    Pluck: { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 } },
    Pad: { oscillator: { type: 'triangle' }, envelope: { attack: 0.5, decay: 1, sustain: 0.8, release: 2 } },
    Digital: { oscillator: { type: 'fmsquare' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 1 } },
    Keys: { oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.18, sustain: 0.35, release: 0.4 } },
    'Mono Bass': { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.003, decay: 0.16, sustain: 0.45, release: 0.22 } },
    'Silk Pad': { oscillator: { type: 'triangle' }, envelope: { attack: 0.8, decay: 1.6, sustain: 0.9, release: 2.8 } },
    Glass: { oscillator: { type: 'sine' }, envelope: { attack: 0.02, decay: 0.28, sustain: 0.5, release: 1.1 } },
    'Chord Stab': { oscillator: { type: 'square' }, envelope: { attack: 0.004, decay: 0.14, sustain: 0.12, release: 0.2 } },
    'House Organ': { oscillator: { type: 'sawtooth' }, envelope: { attack: 0.006, decay: 0.22, sustain: 0.62, release: 0.4 } },
  },
  'FM Lead': {
    Default: { oscillator: { type: 'fmsawtooth', modulationType: 'square', modulationIndex: 10, harmonicity: 3.4 }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 1 } },
    Screamer: { oscillator: { type: 'fmsquare', modulationType: 'sawtooth', modulationIndex: 20, harmonicity: 1.5 }, envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.5 } },
    Neon: { oscillator: { type: 'fmsawtooth', modulationType: 'triangle', modulationIndex: 14, harmonicity: 2.4 }, envelope: { attack: 0.005, decay: 0.22, sustain: 0.32, release: 0.65 } },
    Razor: { oscillator: { type: 'fmsquare', modulationType: 'square', modulationIndex: 26, harmonicity: 1.1 }, envelope: { attack: 0.001, decay: 0.08, sustain: 0.08, release: 0.24 } },
    'Dream Lead': { oscillator: { type: 'fmtriangle', modulationType: 'sine', modulationIndex: 8, harmonicity: 4.2 }, envelope: { attack: 0.02, decay: 0.28, sustain: 0.48, release: 0.9 } },
    Hyper: { oscillator: { type: 'fmsawtooth', modulationType: 'sawtooth', modulationIndex: 24, harmonicity: 1.8 }, envelope: { attack: 0.002, decay: 0.12, sustain: 0.16, release: 0.32 } },
  },
};

export const starterTemplates = [
  { id: 'lofi', name: 'Lofi Sketch', description: 'Soft drums and space for chords' },
  { id: 'trap', name: 'Trap Starter', description: 'Busy hats and modern bounce' },
  { id: 'house', name: 'House Groove', description: 'Four on the floor with offbeat hats' },
  { id: 'techno', name: 'Techno Loop', description: 'Driving kick-led loop' },
  { id: 'intro', name: 'Intro Builder', description: 'Sparse setup for a clean intro section' },
  { id: 'drop', name: 'Drop Builder', description: 'Dense pattern setup for chorus or drop' },
  { id: 'outro', name: 'Outro Builder', description: 'Minimal ending loop with fade energy' },
] as const;

export interface ChordProgressionPreset {
  id: string;
  name: string;
  key: string;
  scale: 'major' | 'minor';
  degrees: number[];
  style: 'triad' | 'seventh';
}

export const chordProgressionPresets: ChordProgressionPreset[] = [
  { id: 'sunset-house', name: 'Sunset House', key: 'C', scale: 'major', degrees: [1, 5, 6, 4], style: 'triad' },
  { id: 'lofi-drift', name: 'Lofi Drift', key: 'D', scale: 'minor', degrees: [1, 6, 3, 7], style: 'seventh' },
  { id: 'trap-noir', name: 'Trap Noir', key: 'A', scale: 'minor', degrees: [1, 6, 7, 5], style: 'triad' },
  { id: 'neon-lift', name: 'Neon Lift', key: 'G', scale: 'major', degrees: [1, 5, 6, 4], style: 'seventh' },
  { id: 'midnight-drive', name: 'Midnight Drive', key: 'F', scale: 'minor', degrees: [1, 7, 6, 5], style: 'triad' },
];

export const presetTags: Record<string, string[]> = {
  '808 Kick::Default': ['clean', 'starter'],
  '808 Kick::Club': ['club', 'house'],
  '808 Kick::Thump': ['trap', 'heavy'],
  '808 Snare::Dusty': ['lofi', 'dusty'],
  '808 Snare::Bright': ['trap', 'crisp'],
  '808 Closed Hat::Airy': ['lofi', 'soft'],
  '808 Closed Hat::Crisp': ['house', 'sharp'],
  '808 Open Hat::Shimmer': ['house', 'bright'],
  '808 Clap::Wide': ['house', 'wide'],
  '808 Clap::Snap': ['trap', 'tight'],
  'Synth::Silk Pad': ['lofi', 'pad'],
  'Synth::House Organ': ['house', 'keys'],
  'Synth::Mono Bass': ['trap', 'bass'],
  'Synth::Chord Stab': ['house', 'stab'],
  'FM Lead::Dream Lead': ['lofi', 'lead'],
  'FM Lead::Hyper': ['trap', 'lead'],
  'FM Lead::Razor': ['techno', 'lead'],
  'FM Lead::Neon': ['house', 'lead'],
};

export const presetPacks = [
  { name: 'House Essentials', favorites: ['808 Kick::Club', '808 Clap::Wide', '808 Closed Hat::Crisp', '808 Open Hat::Shimmer', 'Synth::House Organ', 'Synth::Chord Stab', 'FM Lead::Neon'] },
  { name: 'Trap Vault', favorites: ['808 Kick::Thump', '808 Snare::Bright', '808 Clap::Snap', '808 Closed Hat::Crisp', 'Synth::Mono Bass', 'FM Lead::Hyper'] },
  { name: 'Lofi Palette', favorites: ['808 Kick::Soft', '808 Snare::Dusty', '808 Closed Hat::Airy', '808 Open Hat::Wash', 'Synth::Silk Pad', 'Synth::Glass', 'FM Lead::Dream Lead'] },
] as const;

export interface PresetBankFile {
  format: 'geminidaw-preset-bank';
  formatVersion: 1;
  favorites: string[];
}

export interface PresetPackFile {
  format: 'geminidaw-preset-pack';
  formatVersion: 1;
  name: string;
  favorites: string[];
}

export interface Note {
  id: string;
  pitch: string;
  step: number;
  duration: string;
}

export interface Channel {
  id: string;
  name: string;
  color: string;
  steps: Step[];
  notes: Note[];
  volume: number;
  pan: number;
  synthType: SynthType;
  preset: string;
  mixerInsertId: string;
}

export interface PatternChannelData {
  channelId: string;
  steps: Step[];
  notes: Note[];
}

export interface PatternSlot {
  id: string;
  name: string;
  color: string;
  length: number;
  channels: PatternChannelData[];
}

export interface SampleAsset {
  id: string;
  name: string;
  color: string;
  kind: 'drum' | 'texture' | 'fx';
}

export interface AutomationPoint {
  id: string;
  x: number;
  value: number;
}

export interface PlaylistClip {
  id: string;
  clipType: 'pattern' | 'audio' | 'automation';
  patternId?: string;
  sampleId?: string;
  automationTarget?: string;
  row: number;
  start: number;
  length: number;
  automationPoints?: AutomationPoint[];
}

export interface SongSection {
  id: string;
  name: string;
  color: string;
  start: number;
  length: number;
}

export interface MixerSend {
  id: string;
  targetId: string;
  level: number;
}

export interface MixerFxSlot {
  id: string;
  name: string;
  enabled: boolean;
  wet: number;
  tone: number;
  drive: number;
}

export interface MixerInsert {
  id: string;
  name: string;
  color: string;
  volume: number;
  pan: number;
  fxSlots: MixerFxSlot[];
  sends: MixerSend[];
  channelIds: string[];
  isMaster?: boolean;
}

export interface ProjectData {
  format: 'geminidaw-plugin-state';
  formatVersion: 1;
  pluginTargets: string[];
  bpm: number;
  patternLength: number;
  transportMode: 'pattern' | 'song';
  selectedPatternId: string;
  selectedSampleId: string;
  presetFavorites: string[];
  songSections: SongSection[];
  channels: Channel[];
  patterns: PatternSlot[];
  sampleLibrary: SampleAsset[];
  playlistClips: PlaylistClip[];
  mixerInserts: MixerInsert[];
  masterVolume: number;
}

interface DawState {
  activeView: 'rack' | 'pianoRoll' | 'playlist' | 'mixer';
  transportMode: 'pattern' | 'song';
  selectedChannelId: string | null;
  selectedPatternId: string;
  selectedSampleId: string;
  presetFavorites: string[];
  songSections: SongSection[];
  isPlaying: boolean;
  bpm: number;
  masterVolume: number;
  currentStep: number;
  patternLength: number;
  channels: Channel[];
  patterns: PatternSlot[];
  sampleLibrary: SampleAsset[];
  playlistClips: PlaylistClip[];
  mixerInserts: MixerInsert[];
  midiInputs: string[];
  selectedMidiInput: string | null;
  midiError: string | null;
  projectStatus: string;
  lastSavedAt: number | null;

  setView: (view: 'rack' | 'pianoRoll' | 'playlist' | 'mixer') => void;
  setTransportMode: (mode: 'pattern' | 'song') => void;
  setSelectedChannel: (id: string | null) => void;
  setSelectedPattern: (id: string) => void;
  setSelectedSample: (id: string) => void;
  addPattern: () => void;
  duplicatePattern: () => void;
  setPatternName: (id: string, name: string) => void;
  setPatternColor: (id: string, color: string) => void;
  loadStarterTemplate: (templateId: string) => void;
  togglePresetFavorite: (synthType: SynthType, presetName: string) => void;
  generateSongArrangement: () => void;
  exportPresetBank: () => PresetBankFile;
  importPresetBank: (bank: Partial<PresetBankFile>) => void;
  loadPresetPack: (packName: string) => void;
  generateChordProgression: (channelId: string, presetId: string) => void;
  setSongSectionName: (sectionId: string, name: string) => void;
  moveSongSection: (sectionId: string, start: number) => void;
  resizeSongSection: (sectionId: string, length: number) => void;
  togglePlay: () => void;
  stop: () => void;
  setBpm: (bpm: number) => void;
  setMasterVolume: (vol: number) => void;
  setCurrentStep: (step: number) => void;
  setPatternLength: (length: number) => void;
  setMidiInputs: (inputs: string[]) => void;
  setSelectedMidiInput: (input: string | null) => void;
  setMidiError: (error: string | null) => void;
  toggleStep: (channelId: string, stepIndex: number) => void;
  addNote: (channelId: string, pitch: string, step: number) => void;
  removeNote: (channelId: string, noteId: string) => void;
  addChannel: (type: SynthType) => void;
  removeChannel: (id: string) => void;
  updateChannelVolume: (id: string, volume: number) => void;
  updateChannelPan: (id: string, pan: number) => void;
  updateChannelSteps: (id: string, steps: Step[]) => void;
  setChannelPreset: (id: string, preset: string) => void;
  setChannelMixerInsert: (channelId: string, insertId: string) => void;
  setMixerInsertName: (insertId: string, name: string) => void;
  setMixerInsertVolume: (insertId: string, volume: number) => void;
  setMixerInsertPan: (insertId: string, pan: number) => void;
  setMixerInsertFxSlot: (insertId: string, slotIndex: number, value: string) => void;
  setMixerFxParam: (insertId: string, slotIndex: number, key: 'wet' | 'tone' | 'drive', value: number) => void;
  toggleMixerFxEnabled: (insertId: string, slotIndex: number) => void;
  setMixerSendTarget: (insertId: string, sendId: string, targetId: string) => void;
  setMixerSendLevel: (insertId: string, sendId: string, level: number) => void;
  addPlaylistClip: (patternId: string, row: number, start: number, length?: number) => void;
  addAudioClip: (sampleId: string, row: number, start: number, length?: number) => void;
  addAutomationClip: (target: string, row: number, start: number, length?: number) => void;
  setAutomationPoint: (clipId: string, pointId: string, x: number, value: number) => void;
  addAutomationPoint: (clipId: string, x: number, value: number) => void;
  removePlaylistClip: (clipId: string) => void;
  movePlaylistClip: (clipId: string, row: number, start: number) => void;
  resizePlaylistClip: (clipId: string, length: number) => void;
  clearPlaylist: () => void;
  clearSteps: () => void;
  saveProject: () => void;
  loadProject: () => void;
  getProjectData: () => ProjectData;
  importProjectData: (projectData: Partial<ProjectData>) => void;
}

const createId = () => crypto.randomUUID();
const createEmptySteps = (count = DEFAULT_PATTERN_LENGTH) => Array.from({ length: count }, () => ({ isActive: false }));
const createMixerInsertId = (channelId: string) => `insert-${channelId}`;
const isSynthType = (value: string): value is SynthType => allSynths.includes(value as SynthType);
const createFxSlot = (name = 'Empty'): MixerFxSlot => ({
  id: createId(),
  name,
  enabled: name !== 'Empty',
  wet: name === 'Empty' ? 0 : 0.35,
  tone: 0.5,
  drive: 0.2,
});

const defaultSampleLibrary: SampleAsset[] = [
  { id: createId(), name: 'Tape Kick', color: '#ff9c2f', kind: 'drum' },
  { id: createId(), name: 'Dust Hat', color: '#9ad94f', kind: 'drum' },
  { id: createId(), name: 'Vinyl Vox', color: '#7ab8ff', kind: 'texture' },
  { id: createId(), name: 'Laser Rise', color: '#ff5d55', kind: 'fx' },
  // Additional drum samples
  { id: createId(), name: 'Kick 909', color: '#e67e22', kind: 'drum' },
  { id: createId(), name: 'Snare 808', color: '#c0392b', kind: 'drum' },
  { id: createId(), name: 'Hi-Hat Closed', color: '#2980b9', kind: 'drum' },
  { id: createId(), name: 'Hi-Hat Open', color: '#8e44ad', kind: 'drum' },
  { id: createId(), name: 'Clap Tight', color: '#16a085', kind: 'drum' },
  { id: createId(), name: 'Percussion', color: '#f39c12', kind: 'drum' },
  // 808 Drumkits from web search
  ...samplePacks.flatMap(pack => pack.samples.map(sample => ({ id: createId(), ...sample }))),
];

const PLUGIN_TARGETS = ['VST3-ready-state', 'AU-ready-state', 'CLAP-ready-state'];

const normalizeNotes = (notes: Note[] | undefined, patternLength: number): Note[] =>
  (notes || [])
    .filter((note) => typeof note.step === 'number' && note.step >= 0 && note.step < patternLength)
    .map((note) => ({
      id: note.id || createId(),
      pitch: note.pitch,
      step: note.step,
      duration: note.duration || '16n',
    }));

const normalizeSteps = (steps: Step[] | undefined, patternLength: number): Step[] => {
  const normalized = createEmptySteps(patternLength);
  steps?.slice(0, patternLength).forEach((step, index) => {
    normalized[index] = { isActive: Boolean(step?.isActive) };
  });
  return normalized;
};

const createChannel = (type: SynthType, stepCount = DEFAULT_PATTERN_LENGTH, overrides: Partial<Channel> = {}): Channel => {
  const id = overrides.id || createId();
  return {
    id,
    name: type,
    color: '#6e7275',
    steps: createEmptySteps(stepCount),
    notes: [],
    volume: 0.8,
    pan: 0,
    synthType: type,
    preset: 'Default',
    mixerInsertId: createMixerInsertId(id),
    ...overrides,
  };
};

const defaultChannels: Channel[] = [
  createChannel('808 Kick', DEFAULT_PATTERN_LENGTH, { name: '808 Kick', color: '#5b6b5b' }),
  createChannel('808 Clap', DEFAULT_PATTERN_LENGTH, { name: '808 Clap', color: '#6b5b5b' }),
  createChannel('808 Closed Hat', DEFAULT_PATTERN_LENGTH, { name: '808 Hat (C)', color: '#5b5b6b', volume: 0.6 }),
  createChannel('808 Snare', DEFAULT_PATTERN_LENGTH, { name: '808 Snare', color: '#6b6b5b', volume: 0.7 }),
];

const snapshotPatternChannels = (channels: Channel[], patternLength: number): PatternChannelData[] =>
  channels.map((channel) => ({
    channelId: channel.id,
    steps: normalizeSteps(channel.steps, patternLength),
    notes: normalizeNotes(channel.notes, patternLength),
  }));

const createPattern = (name: string, channels: Channel[], patternLength: number, overrides: Partial<PatternSlot> = {}): PatternSlot => ({
  id: createId(),
  name,
  color: '#ff9c2f',
  length: patternLength,
  channels: snapshotPatternChannels(channels, patternLength),
  ...overrides,
});

const createEmptyPattern = (name: string, channels: Channel[], patternLength: number): PatternSlot =>
  createPattern(name, channels.map((channel) => ({ ...channel, steps: createEmptySteps(patternLength), notes: [] })), patternLength, {
    color: '#7ab8ff',
  });

const createStepPattern = (patternLength: number, activeSteps: number[]) =>
  createEmptySteps(patternLength).map((step, index) => ({ isActive: activeSteps.includes(index) }));

const createTemplateNotes = (notes: Array<{ pitch: string; step: number; duration?: string }>) =>
  notes.map((note) => ({ id: createId(), pitch: note.pitch, step: note.step, duration: note.duration || '16n' }));

const NOTE_INDEX: Record<string, number> = {
  C: 0,
  'C#': 1,
  D: 2,
  'D#': 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  'G#': 8,
  A: 9,
  'A#': 10,
  B: 11,
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];
const PIANO_ROLL_MIN_MIDI = 48;
const PIANO_ROLL_MAX_MIDI = 72;

const midiToPitch = (midi: number) => `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;

const fitMidiToPianoRoll = (midi: number) => {
  let nextMidi = midi;
  while (nextMidi < PIANO_ROLL_MIN_MIDI) nextMidi += 12;
  while (nextMidi > PIANO_ROLL_MAX_MIDI) nextMidi -= 12;
  return Math.min(PIANO_ROLL_MAX_MIDI, Math.max(PIANO_ROLL_MIN_MIDI, nextMidi));
};

const getChordDuration = (segmentLength: number) => {
  if (segmentLength >= 16) return '1m';
  if (segmentLength >= 8) return '2n';
  if (segmentLength >= 4) return '4n';
  return '8n';
};

const getProgressionNotes = (patternLength: number, preset: ChordProgressionPreset) => {
  const rootIndex = NOTE_INDEX[preset.key] ?? 0;
  const scale = preset.scale === 'minor' ? MINOR_SCALE : MAJOR_SCALE;
  const segmentLength = Math.max(1, Math.floor(patternLength / Math.max(1, preset.degrees.length)));
  const chordIntervals = preset.style === 'seventh' ? [0, 2, 4, 6] : [0, 2, 4];
  const baseMidi = preset.scale === 'minor' ? 57 : 60;

  return preset.degrees.flatMap((degree, chordIndex) => {
    const scaleDegreeIndex = ((degree - 1) % scale.length + scale.length) % scale.length;
    const degreeRootMidi = baseMidi + rootIndex + scale[scaleDegreeIndex];
    const step = Math.min(patternLength - 1, chordIndex * segmentLength);
    return chordIntervals.map((interval) => {
      const totalDegree = scaleDegreeIndex + interval;
      const semitone = scale[totalDegree % scale.length] + Math.floor(totalDegree / scale.length) * 12;
      return {
        id: createId(),
        pitch: midiToPitch(fitMidiToPianoRoll(degreeRootMidi + semitone - rootIndex)),
        step,
        duration: getChordDuration(segmentLength),
      };
    });
  });
};

const applyStarterTemplateToChannels = (channels: Channel[], patternLength: number, templateId: string): Channel[] => {
  const ensureSynth = channels.some((channel) => melodicSynths.includes(channel.synthType));
  const nextChannels = ensureSynth ? [...channels] : [...channels, createChannel('Synth', patternLength, { name: 'Starter Synth', color: '#4f6a86', preset: 'House Organ' })];

  const templateMap: Record<string, { bpm: number; channels: Record<SynthType, { steps?: number[]; notes?: Array<{ pitch: string; step: number; duration?: string }>; preset?: string }> }> = {
    lofi: {
      bpm: 84,
      channels: {
        '808 Kick': { steps: [0, 8] },
        '808 Clap': { steps: [4, 12], preset: 'Wide' },
        '808 Closed Hat': { steps: [2, 6, 10, 14], preset: 'Airy' },
        '808 Open Hat': { steps: [15], preset: 'Wash' },
        '808 Snare': { steps: [12], preset: 'Dusty' },
        '808 Cowbell': { steps: [] },
        Synth: { notes: [{ pitch: 'C4', step: 0, duration: '4n' }, { pitch: 'G4', step: 8, duration: '4n' }], preset: 'Silk Pad' },
        'FM Lead': { notes: [{ pitch: 'E4', step: 4, duration: '8n' }], preset: 'Dream Lead' },
      },
    },
    trap: {
      bpm: 142,
      channels: {
        '808 Kick': { steps: [0, 3, 10], preset: 'Thump' },
        '808 Clap': { steps: [4, 12], preset: 'Snap' },
        '808 Closed Hat': { steps: [0, 2, 4, 6, 7, 8, 10, 12, 14, 15], preset: 'Crisp' },
        '808 Open Hat': { steps: [11], preset: 'Shimmer' },
        '808 Snare': { steps: [12], preset: 'Bright' },
        '808 Cowbell': { steps: [] },
        Synth: { notes: [{ pitch: 'C3', step: 0, duration: '8n' }, { pitch: 'A#2', step: 8, duration: '8n' }], preset: 'Mono Bass' },
        'FM Lead': { notes: [{ pitch: 'C5', step: 6, duration: '16n' }, { pitch: 'D#5', step: 14, duration: '16n' }], preset: 'Hyper' },
      },
    },
    house: {
      bpm: 124,
      channels: {
        '808 Kick': { steps: [0, 4, 8, 12], preset: 'Club' },
        '808 Clap': { steps: [4, 12], preset: 'Wide' },
        '808 Closed Hat': { steps: [2, 6, 10, 14], preset: 'Crisp' },
        '808 Open Hat': { steps: [6, 14], preset: 'Shimmer' },
        '808 Snare': { steps: [] },
        '808 Cowbell': { steps: [3, 11], preset: 'Ring' },
        Synth: { notes: [{ pitch: 'C4', step: 0, duration: '8n' }, { pitch: 'E4', step: 4, duration: '8n' }, { pitch: 'G4', step: 8, duration: '8n' }, { pitch: 'A4', step: 12, duration: '8n' }], preset: 'House Organ' },
        'FM Lead': { notes: [{ pitch: 'G4', step: 15, duration: '16n' }], preset: 'Neon' },
      },
    },
    techno: {
      bpm: 132,
      channels: {
        '808 Kick': { steps: [0, 4, 8, 12], preset: 'Club' },
        '808 Clap': { steps: [] },
        '808 Closed Hat': { steps: [2, 6, 10, 14], preset: 'Tight' },
        '808 Open Hat': { steps: [7, 15], preset: 'Long' },
        '808 Snare': { steps: [4, 12], preset: 'Arena' },
        '808 Cowbell': { steps: [5, 13], preset: 'Bellish' },
        Synth: { notes: [{ pitch: 'C3', step: 0, duration: '4n' }, { pitch: 'D#3', step: 4, duration: '4n' }, { pitch: 'G3', step: 8, duration: '4n' }, { pitch: 'A#3', step: 12, duration: '4n' }], preset: 'Digital' },
        'FM Lead': { notes: [{ pitch: 'C5', step: 3, duration: '8n' }, { pitch: 'G4', step: 11, duration: '8n' }], preset: 'Razor' },
      },
    },
    intro: {
      bpm: 118,
      channels: {
        '808 Kick': { steps: [0, 8], preset: 'Soft' },
        '808 Clap': { steps: [], preset: 'Wide' },
        '808 Closed Hat': { steps: [6, 14], preset: 'Airy' },
        '808 Open Hat': { steps: [], preset: 'Wash' },
        '808 Snare': { steps: [], preset: 'Dusty' },
        '808 Cowbell': { steps: [] },
        Synth: { notes: [{ pitch: 'C4', step: 0, duration: '2n' }], preset: 'Silk Pad' },
        'FM Lead': { notes: [], preset: 'Dream Lead' },
      },
    },
    drop: {
      bpm: 128,
      channels: {
        '808 Kick': { steps: [0, 4, 8, 10, 12], preset: 'Club' },
        '808 Clap': { steps: [4, 12], preset: 'Wide' },
        '808 Closed Hat': { steps: [0, 2, 4, 6, 8, 10, 12, 14], preset: 'Crisp' },
        '808 Open Hat': { steps: [6, 14], preset: 'Shimmer' },
        '808 Snare': { steps: [12], preset: 'Bright' },
        '808 Cowbell': { steps: [3, 11], preset: 'Ring' },
        Synth: { notes: [{ pitch: 'C4', step: 0, duration: '8n' }, { pitch: 'G4', step: 4, duration: '8n' }, { pitch: 'A#4', step: 8, duration: '8n' }, { pitch: 'G4', step: 12, duration: '8n' }], preset: 'Chord Stab' },
        'FM Lead': { notes: [{ pitch: 'C5', step: 7, duration: '16n' }, { pitch: 'D#5', step: 15, duration: '16n' }], preset: 'Hyper' },
      },
    },
    outro: {
      bpm: 110,
      channels: {
        '808 Kick': { steps: [0, 8], preset: 'Soft' },
        '808 Clap': { steps: [12], preset: 'Short' },
        '808 Closed Hat': { steps: [2, 10], preset: 'Airy' },
        '808 Open Hat': { steps: [], preset: 'Long' },
        '808 Snare': { steps: [], preset: 'Dusty' },
        '808 Cowbell': { steps: [] },
        Synth: { notes: [{ pitch: 'C4', step: 0, duration: '2n' }, { pitch: 'G3', step: 8, duration: '2n' }], preset: 'Glass' },
        'FM Lead': { notes: [], preset: 'Dream Lead' },
      },
    },
  };

  const template = templateMap[templateId] || templateMap.house;

  return nextChannels.map((channel) => {
    const config = template.channels[channel.synthType];
    if (!config) {
      return { ...channel, steps: createEmptySteps(patternLength), notes: [] };
    }

    return {
      ...channel,
      steps: config.steps ? createStepPattern(patternLength, config.steps) : createEmptySteps(patternLength),
      notes: config.notes ? createTemplateNotes(config.notes) : [],
      preset: config.preset && defaultPresets[channel.synthType][config.preset] ? config.preset : channel.preset,
    };
  });
};

const updateChannelCollection = (channels: Channel[], channelId: string, updater: ChannelUpdater) => {
  const index = channels.findIndex((channel) => channel.id === channelId);
  if (index === -1) {
    return channels;
  }

  const nextChannels = [...channels];
  nextChannels[index] = updater(channels[index]);
  return nextChannels;
};

const applyPatternToChannels = (channels: Channel[], pattern: PatternSlot, patternLength: number): Channel[] => {
  const patternMap = new Map(pattern.channels.map((channel) => [channel.channelId, channel]));
  return channels.map((channel) => {
    const patternChannel = patternMap.get(channel.id);
    return {
      ...channel,
      steps: normalizeSteps(patternChannel?.steps, patternLength),
      notes: normalizeNotes(patternChannel?.notes, patternLength),
    };
  });
};

const alignPatternToChannels = (pattern: PatternSlot, channels: Channel[], patternLength: number): PatternSlot => {
  const channelMap = new Map(pattern.channels.map((channel) => [channel.channelId, channel]));
  return {
    ...pattern,
    length: patternLength,
    channels: channels.map((channel) => {
      const existing = channelMap.get(channel.id);
      return {
        channelId: channel.id,
        steps: normalizeSteps(existing?.steps, patternLength),
        notes: normalizeNotes(existing?.notes, patternLength),
      };
    }),
  };
};

const syncSelectedPattern = (patterns: PatternSlot[], selectedPatternId: string, channels: Channel[], patternLength: number): PatternSlot[] =>
  patterns.map((pattern) =>
    pattern.id === selectedPatternId
      ? {
          ...pattern,
          length: patternLength,
          channels: snapshotPatternChannels(channels, patternLength),
        }
      : alignPatternToChannels(pattern, channels, patternLength),
  );

const createMixerSend = (targetId = MASTER_INSERT_ID, level = targetId === MASTER_INSERT_ID ? 1 : 0): MixerSend => ({
  id: createId(),
  targetId,
  level,
});

const createMixerInsert = (channel: Channel, index: number): MixerInsert => ({
  id: channel.mixerInsertId,
  name: `Insert ${index + 1}`,
  color: channel.color,
  volume: channel.volume,
  pan: channel.pan,
  fxSlots: Array.from({ length: DEFAULT_FX_SLOTS }, (_, slotIndex) => createFxSlot(slotIndex === 0 ? `${channel.name} FX` : 'Empty')),
  sends: [createMixerSend(MASTER_INSERT_ID, 1), createMixerSend(MASTER_INSERT_ID, 0)],
  channelIds: [channel.id],
});

const createMasterInsert = (): MixerInsert => ({
  id: MASTER_INSERT_ID,
  name: 'Master',
  color: '#ffb640',
  volume: 0.8,
  pan: 0,
  fxSlots: [createFxSlot('Limiter'), createFxSlot('Stereo Shaper'), createFxSlot('Empty'), createFxSlot('Empty')],
  sends: [],
  channelIds: [],
  isMaster: true,
});

const buildDefaultMixerInserts = (channels: Channel[]): MixerInsert[] => [
  ...channels.map((channel, index) => createMixerInsert(channel, index)),
  createMasterInsert(),
];

const normalizeMixerInserts = (mixerInserts: MixerInsert[] | undefined, channels: Channel[], masterVolume: number): MixerInsert[] => {
  const providedMap = new Map((mixerInserts || []).map((insert) => [insert.id, insert]));
  const inserts: MixerInsert[] = channels.map((channel, index) => {
    const provided = providedMap.get(channel.mixerInsertId);
    return {
      id: channel.mixerInsertId,
      name: provided?.name || `Insert ${index + 1}`,
      color: provided?.color || channel.color,
      volume: typeof provided?.volume === 'number' ? provided.volume : channel.volume,
      pan: typeof provided?.pan === 'number' ? provided.pan : channel.pan,
      fxSlots: Array.from({ length: DEFAULT_FX_SLOTS }, (_, slotIndex) => {
        const existing = provided?.fxSlots?.[slotIndex];
        return existing
          ? { ...createFxSlot(existing.name), ...existing }
          : createFxSlot('Empty');
      }),
      sends: Array.from({ length: DEFAULT_SEND_SLOTS }, (_, sendIndex) => {
        const existing = provided?.sends?.[sendIndex];
        return {
          id: existing?.id || createId(),
          targetId: existing?.targetId || MASTER_INSERT_ID,
          level: typeof existing?.level === 'number' ? existing.level : sendIndex === 0 ? 1 : 0,
        };
      }),
      channelIds: provided?.channelIds?.filter((channelId) => channels.some((channel) => channel.id === channelId)) || [channel.id],
    };
  });

  const providedMaster = providedMap.get(MASTER_INSERT_ID);
  inserts.push({
    id: MASTER_INSERT_ID,
    name: providedMaster?.name || 'Master',
    color: providedMaster?.color || '#ffb640',
    volume: typeof providedMaster?.volume === 'number' ? providedMaster.volume : masterVolume,
    pan: typeof providedMaster?.pan === 'number' ? providedMaster.pan : 0,
    fxSlots: Array.from({ length: DEFAULT_FX_SLOTS }, (_, slotIndex) => {
      const existing = providedMaster?.fxSlots?.[slotIndex];
      return existing
        ? { ...createFxSlot(existing.name), ...existing }
        : createFxSlot(slotIndex === 0 ? 'Limiter' : 'Empty');
    }),
    sends: [],
    channelIds: [],
    isMaster: true,
  });

  return inserts;
};

const defaultPatterns: PatternSlot[] = [
  createPattern('Pattern 1', defaultChannels, DEFAULT_PATTERN_LENGTH, { color: '#ff9c2f' }),
  createEmptyPattern('Pattern 2', defaultChannels, DEFAULT_PATTERN_LENGTH),
  createEmptyPattern('Pattern 3', defaultChannels, DEFAULT_PATTERN_LENGTH),
];

const defaultPlaylistClips: PlaylistClip[] = [
  { id: createId(), clipType: 'pattern', patternId: defaultPatterns[0].id, row: 0, start: 0, length: 4 },
  { id: createId(), clipType: 'pattern', patternId: defaultPatterns[1].id, row: 1, start: 4, length: 4 },
  { id: createId(), clipType: 'pattern', patternId: defaultPatterns[2].id, row: 2, start: 8, length: 4 },
];

const defaultAutomationPoints = (): AutomationPoint[] => [
  { id: createId(), x: 0, value: 0.25 },
  { id: createId(), x: 1, value: 0.75 },
];

const createPresetFavoriteKey = (synthType: SynthType, presetName: string) => `${synthType}::${presetName}`;

const createGeneratedArrangement = (patterns: PatternSlot[]): PlaylistClip[] => {
  const usablePatterns = patterns.slice(0, 4);
  if (usablePatterns.length === 0) return [];

  const arrangement: PlaylistClip[] = [
    { id: createId(), clipType: 'pattern', patternId: usablePatterns[0]?.id, row: 0, start: 0, length: 4 },
    { id: createId(), clipType: 'pattern', patternId: usablePatterns[0]?.id, row: 0, start: 4, length: 4 },
    { id: createId(), clipType: 'pattern', patternId: usablePatterns[1]?.id || usablePatterns[0]?.id, row: 1, start: 8, length: 4 },
    { id: createId(), clipType: 'pattern', patternId: usablePatterns[2]?.id || usablePatterns[0]?.id, row: 2, start: 12, length: 4 },
    { id: createId(), clipType: 'pattern', patternId: usablePatterns[3]?.id || usablePatterns[1]?.id || usablePatterns[0]?.id, row: 0, start: 16, length: 8 },
    { id: createId(), clipType: 'automation', automationTarget: 'masterVolume', row: 6, start: 0, length: 8, automationPoints: [{ id: createId(), x: 0, value: 0.15 }, { id: createId(), x: 1, value: 0.9 }] },
    { id: createId(), clipType: 'automation', automationTarget: 'masterVolume', row: 6, start: 16, length: 8, automationPoints: [{ id: createId(), x: 0, value: 0.95 }, { id: createId(), x: 1, value: 0.55 }] },
  ];

  return arrangement.filter((clip) => clip.clipType !== 'pattern' || Boolean(clip.patternId));
};

const createGeneratedSections = (): SongSection[] => [
  { id: createId(), name: 'Intro', color: '#7ab8ff', start: 0, length: 8 },
  { id: createId(), name: 'Build', color: '#9ad94f', start: 8, length: 8 },
  { id: createId(), name: 'Drop', color: '#ff9c2f', start: 16, length: 8 },
];

const normalizeChannel = (channel: Partial<Channel>, patternLength: number): Channel => {
  const synthType = isSynthType(channel.synthType ?? '') ? channel.synthType : 'Synth';
  const availablePresets = Object.keys(defaultPresets[synthType]);
  const preset = channel.preset && availablePresets.includes(channel.preset) ? channel.preset : 'Default';
  const id = channel.id || createId();

  return {
    id,
    name: channel.name || synthType,
    color: channel.color || '#6e7275',
    steps: normalizeSteps(channel.steps, patternLength),
    notes: normalizeNotes(channel.notes, patternLength),
    volume: typeof channel.volume === 'number' ? channel.volume : 0.8,
    pan: typeof channel.pan === 'number' ? channel.pan : 0,
    synthType,
    preset,
    mixerInsertId: channel.mixerInsertId || createMixerInsertId(id),
  };
};

const normalizeProjectData = (projectData: Partial<ProjectData>): ProjectData => {
  const patternLength = PATTERN_LENGTH_OPTIONS.includes(projectData.patternLength as (typeof PATTERN_LENGTH_OPTIONS)[number])
    ? (projectData.patternLength as number)
    : DEFAULT_PATTERN_LENGTH;

  const channels = projectData.channels?.length
    ? projectData.channels.map((channel) => normalizeChannel(channel, patternLength))
    : defaultChannels.map((channel) => normalizeChannel(channel, patternLength));

  const rawPatterns = projectData.patterns?.length
    ? projectData.patterns.map((pattern) => alignPatternToChannels({
        id: pattern.id || createId(),
        name: pattern.name || 'Pattern',
        color: pattern.color || '#ff9c2f',
        length: patternLength,
        channels: pattern.channels || [],
      }, channels, patternLength))
    : defaultPatterns.map((pattern) => alignPatternToChannels(pattern, channels, patternLength));

  const selectedPatternId = rawPatterns.some((pattern) => pattern.id === projectData.selectedPatternId)
    ? (projectData.selectedPatternId as string)
    : rawPatterns[0].id;

  const validPatternIds = new Set(rawPatterns.map((pattern) => pattern.id));
  const sampleLibrary = projectData.sampleLibrary?.length ? projectData.sampleLibrary : defaultSampleLibrary;
  const validSampleIds = new Set(sampleLibrary.map((sample) => sample.id));
  const songSections = (projectData.songSections || createGeneratedSections()).map((section) => ({
    id: section.id || createId(),
    name: section.name || 'Section',
    color: section.color || '#7ab8ff',
    start: Math.max(0, section.start),
    length: Math.max(1, section.length || 4),
  }));
  const playlistClips = (projectData.playlistClips || defaultPlaylistClips)
    .filter((clip) => typeof clip.row === 'number' && typeof clip.start === 'number')
    .map((clip) => ({
      id: clip.id || createId(),
      clipType: clip.clipType || 'pattern',
      patternId: clip.patternId,
      sampleId: clip.sampleId,
      automationTarget: clip.automationTarget,
      row: Math.max(0, clip.row),
      start: Math.max(0, clip.start),
      length: Math.max(1, clip.length || 4),
      automationPoints: clip.clipType === 'automation'
        ? (clip.automationPoints?.length
            ? clip.automationPoints.map((point) => ({
                id: point.id || createId(),
                x: Math.min(1, Math.max(0, point.x)),
                value: Math.min(1, Math.max(0, point.value)),
              })).sort((a, b) => a.x - b.x)
            : defaultAutomationPoints())
        : undefined,
    }))
    .filter((clip) =>
      (clip.clipType === 'pattern' && clip.patternId && validPatternIds.has(clip.patternId)) ||
      (clip.clipType === 'audio' && clip.sampleId && validSampleIds.has(clip.sampleId)) ||
      (clip.clipType === 'automation' && Boolean(clip.automationTarget)),
    );

  const masterVolume = typeof projectData.masterVolume === 'number' ? projectData.masterVolume : 0.8;
  const mixerInserts = normalizeMixerInserts(projectData.mixerInserts, channels, masterVolume);
  const selectedPattern = rawPatterns.find((pattern) => pattern.id === selectedPatternId) || rawPatterns[0];

  return {
    format: 'geminidaw-plugin-state',
    formatVersion: 1,
    pluginTargets: PLUGIN_TARGETS,
    bpm: typeof projectData.bpm === 'number' ? projectData.bpm : 130,
    patternLength,
    transportMode: projectData.transportMode === 'song' ? 'song' : 'pattern',
    selectedPatternId,
    selectedSampleId: sampleLibrary[0]?.id ?? '',
    presetFavorites: projectData.presetFavorites || [],
    songSections,
    channels: applyPatternToChannels(channels, selectedPattern, patternLength),
    patterns: rawPatterns,
    sampleLibrary,
    playlistClips,
    mixerInserts,
    masterVolume,
  };
};

export const useDawStore = create<DawState>((set, get) => ({
  activeView: 'rack',
  transportMode: 'pattern',
  selectedChannelId: defaultChannels[0]?.id ?? null,
  selectedPatternId: defaultPatterns[0].id,
  selectedSampleId: defaultSampleLibrary[0]?.id ?? '',
  presetFavorites: [],
  songSections: createGeneratedSections(),
  isPlaying: false,
  bpm: 130,
  masterVolume: 0.8,
  currentStep: 0,
  patternLength: DEFAULT_PATTERN_LENGTH,
  channels: [...defaultChannels],
  patterns: defaultPatterns,
  sampleLibrary: defaultSampleLibrary,
  playlistClips: defaultPlaylistClips,
  mixerInserts: buildDefaultMixerInserts(defaultChannels),
  midiInputs: [],
  selectedMidiInput: null,
  midiError: null,
  projectStatus: 'Ready',
  lastSavedAt: null,

  setView: (view) => set({ activeView: view }),
  setTransportMode: (transportMode) => set({ transportMode, currentStep: 0, projectStatus: `Transport set to ${transportMode}` }),
  setSelectedChannel: (id) => set({ selectedChannelId: id }),
  setSelectedSample: (id) => set({ selectedSampleId: id }),
  setSelectedPattern: (id) => set((state) => {
    const patterns = syncSelectedPattern(state.patterns, state.selectedPatternId, state.channels, state.patternLength);
    const nextPattern = patterns.find((pattern) => pattern.id === id);
    if (!nextPattern) {
      return state;
    }

    return {
      patterns,
      selectedPatternId: id,
      channels: applyPatternToChannels(state.channels, nextPattern, state.patternLength),
      currentStep: 0,
      projectStatus: `Switched to ${nextPattern.name}`,
    };
  }),
  addPattern: () => set((state) => {
    const patterns = syncSelectedPattern(state.patterns, state.selectedPatternId, state.channels, state.patternLength);
    const nextPattern = createEmptyPattern(`Pattern ${patterns.length + 1}`, state.channels, state.patternLength);
    return {
      patterns: [...patterns, nextPattern],
      selectedPatternId: nextPattern.id,
      channels: applyPatternToChannels(state.channels, nextPattern, state.patternLength),
      currentStep: 0,
      projectStatus: `${nextPattern.name} created`,
    };
  }),
  duplicatePattern: () => set((state) => {
    const patterns = syncSelectedPattern(state.patterns, state.selectedPatternId, state.channels, state.patternLength);
    const source = patterns.find((pattern) => pattern.id === state.selectedPatternId);
    if (!source) {
      return state;
    }

    const duplicate: PatternSlot = {
      ...source,
      id: createId(),
      name: `${source.name} Copy`,
      channels: source.channels.map((channel) => ({
        channelId: channel.channelId,
        steps: normalizeSteps(channel.steps, state.patternLength),
        notes: normalizeNotes(channel.notes, state.patternLength),
      })),
    };

    return {
      patterns: [...patterns, duplicate],
      selectedPatternId: duplicate.id,
      channels: applyPatternToChannels(state.channels, duplicate, state.patternLength),
      currentStep: 0,
      projectStatus: `${duplicate.name} duplicated`,
    };
  }),
  setPatternName: (id, name) => set((state) => ({
    patterns: syncSelectedPattern(state.patterns, state.selectedPatternId, state.channels, state.patternLength).map((pattern) =>
      pattern.id === id ? { ...pattern, name: name.trim() || pattern.name } : pattern,
    ),
    projectStatus: 'Pattern renamed',
  })),
  setPatternColor: (id, color) => set((state) => ({
    patterns: syncSelectedPattern(state.patterns, state.selectedPatternId, state.channels, state.patternLength).map((pattern) =>
      pattern.id === id ? { ...pattern, color } : pattern,
    ),
    projectStatus: 'Pattern color updated',
  })),
  loadStarterTemplate: (templateId) => set((state) => {
    const templateBpmMap: Record<string, number> = { lofi: 84, trap: 142, house: 124, techno: 132, intro: 118, drop: 128, outro: 110 };
    const channels = applyStarterTemplateToChannels(state.channels, state.patternLength, templateId);
    const patterns = syncSelectedPattern(state.patterns, state.selectedPatternId, channels, state.patternLength);
    const mixerInserts = normalizeMixerInserts(state.mixerInserts, channels, state.masterVolume);

    return {
      bpm: templateBpmMap[templateId] || state.bpm,
      channels,
      patterns,
      mixerInserts,
      selectedChannelId: channels[0]?.id ?? null,
      projectStatus: `${templateId} starter loaded`,
    };
  }),
  togglePresetFavorite: (synthType, presetName) => set((state) => {
    const key = createPresetFavoriteKey(synthType, presetName);
    return {
      presetFavorites: state.presetFavorites.includes(key)
        ? state.presetFavorites.filter((item) => item !== key)
        : [...state.presetFavorites, key],
      projectStatus: state.presetFavorites.includes(key) ? 'Preset removed from favorites' : 'Preset added to favorites',
    };
  }),
  generateSongArrangement: () => set((state) => ({
    playlistClips: createGeneratedArrangement(syncSelectedPattern(state.patterns, state.selectedPatternId, state.channels, state.patternLength)),
    songSections: createGeneratedSections(),
    transportMode: 'song',
    activeView: 'playlist',
    currentStep: 0,
    projectStatus: 'Song arrangement generated',
  })),
  exportPresetBank: () => ({
    format: 'geminidaw-preset-bank',
    formatVersion: 1,
    favorites: get().presetFavorites,
  }),
  importPresetBank: (bank) => set({
    presetFavorites: Array.isArray(bank.favorites) ? bank.favorites : [],
    projectStatus: 'Preset bank imported',
  }),
  loadPresetPack: (packName) => set(() => {
    const pack = presetPacks.find((entry) => entry.name === packName);
    return pack
      ? { presetFavorites: [...pack.favorites], projectStatus: `${pack.name} loaded` }
      : { projectStatus: 'Preset pack not found' };
  }),
  generateChordProgression: (channelId, presetId) => set((state) => {
    const preset = chordProgressionPresets.find((entry) => entry.id === presetId) || chordProgressionPresets[0];
    const targetChannel = state.channels.find((channel) => channel.id === channelId);
    if (!targetChannel || !melodicSynths.includes(targetChannel.synthType)) {
      return { projectStatus: 'Select a synth channel to write chords' };
    }

    const channels = updateChannelCollection(state.channels, channelId, (channel) => ({
      ...channel,
      notes: getProgressionNotes(state.patternLength, preset),
    }));

    return {
      channels,
      patterns: syncSelectedPattern(state.patterns, state.selectedPatternId, channels, state.patternLength),
      projectStatus: `${preset.name} progression generated`,
    };
  }),
  setSongSectionName: (sectionId, name) => set((state) => ({
    songSections: state.songSections.map((section) => section.id === sectionId ? { ...section, name: name.trim() || section.name } : section),
    projectStatus: 'Song section renamed',
  })),
  moveSongSection: (sectionId, start) => set((state) => ({
    songSections: state.songSections.map((section) => section.id === sectionId ? { ...section, start: Math.max(0, Math.min(31, start)) } : section),
  })),
  resizeSongSection: (sectionId, length) => set((state) => ({
    songSections: state.songSections.map((section) => section.id === sectionId ? { ...section, length: Math.max(1, Math.min(32, length)) } : section),
  })),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  stop: () => set({ isPlaying: false, currentStep: 0 }),
  setBpm: (bpm) => set({ bpm }),
  setMasterVolume: (masterVolume) => set((state) => ({
    masterVolume,
    mixerInserts: state.mixerInserts.map((insert) => insert.id === MASTER_INSERT_ID ? { ...insert, volume: masterVolume } : insert),
  })),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setPatternLength: (patternLength) => set((state) => {
    if (!PATTERN_LENGTH_OPTIONS.includes(patternLength as (typeof PATTERN_LENGTH_OPTIONS)[number])) {
      return state;
    }

    const resizedChannels = state.channels.map((channel) => ({
      ...channel,
      steps: normalizeSteps(channel.steps, patternLength),
      notes: normalizeNotes(channel.notes, patternLength),
    }));
    const patterns = syncSelectedPattern(state.patterns, state.selectedPatternId, resizedChannels, patternLength);

    return {
      patternLength,
      currentStep: 0,
      channels: resizedChannels,
      patterns,
      projectStatus: `Pattern length set to ${patternLength} steps`,
    };
  }),
  setMidiInputs: (midiInputs) => set({ midiInputs }),
  setSelectedMidiInput: (selectedMidiInput) => set({ selectedMidiInput }),
  setMidiError: (midiError) => set({ midiError }),
  toggleStep: (channelId, stepIndex) => set((state) => {
    const channels = updateChannelCollection(state.channels, channelId, (channel) => ({
      ...channel,
      steps: channel.steps.map((step, index) => index === stepIndex ? { isActive: !step.isActive } : step),
    }));

    return {
      channels,
      patterns: syncSelectedPattern(state.patterns, state.selectedPatternId, channels, state.patternLength),
    };
  }),
  addNote: (channelId, pitch, step) => set((state) => {
    const channels = updateChannelCollection(state.channels, channelId, (channel) => ({
      ...channel,
      notes: [...channel.notes, { id: createId(), pitch, step, duration: '16n' }],
    }));

    return {
      channels,
      patterns: syncSelectedPattern(state.patterns, state.selectedPatternId, channels, state.patternLength),
    };
  }),
  removeNote: (channelId, noteId) => set((state) => {
    const channels = updateChannelCollection(state.channels, channelId, (channel) => ({
      ...channel,
      notes: channel.notes.filter((note) => note.id !== noteId),
    }));

    return {
      channels,
      patterns: syncSelectedPattern(state.patterns, state.selectedPatternId, channels, state.patternLength),
    };
  }),
  addChannel: (type) => set((state) => {
    const channel = createChannel(type, state.patternLength);
    const channels = [...state.channels, channel];
    const patterns = syncSelectedPattern(state.patterns, state.selectedPatternId, channels, state.patternLength);
    const mixerInserts = [
      ...state.mixerInserts.filter((insert) => insert.id !== MASTER_INSERT_ID),
      createMixerInsert(channel, channels.length - 1),
      state.mixerInserts.find((insert) => insert.id === MASTER_INSERT_ID) || createMasterInsert(),
    ];

    return {
      channels,
      patterns,
      mixerInserts,
      projectStatus: `${type} added`,
    };
  }),
  removeChannel: (id) => set((state) => {
    const channels = state.channels.filter((channel) => channel.id !== id);
    const patterns = state.patterns.map((pattern) => ({
      ...pattern,
      channels: pattern.channels.filter((channel) => channel.channelId !== id),
    }));
    const selectedPattern = patterns.find((pattern) => pattern.id === state.selectedPatternId) || patterns[0];
    const nextChannels = selectedPattern ? applyPatternToChannels(channels, selectedPattern, state.patternLength) : channels;
    const mixerInserts = state.mixerInserts
      .filter((insert) => insert.id !== createMixerInsertId(id))
      .map((insert) => ({ ...insert, channelIds: insert.channelIds.filter((channelId) => channelId !== id) }));

    return {
      channels: nextChannels,
      patterns,
      playlistClips: state.playlistClips,
      mixerInserts,
      selectedChannelId: state.selectedChannelId === id ? nextChannels[0]?.id ?? null : state.selectedChannelId,
      projectStatus: 'Channel removed',
    };
  }),
  updateChannelVolume: (id, volume) => set((state) => ({
    channels: updateChannelCollection(state.channels, id, (channel) => ({ ...channel, volume })),
    mixerInserts: state.mixerInserts.map((insert) => insert.id === createMixerInsertId(id) ? { ...insert, volume } : insert),
  })),
  updateChannelPan: (id, pan) => set((state) => ({
    channels: updateChannelCollection(state.channels, id, (channel) => ({ ...channel, pan })),
    mixerInserts: state.mixerInserts.map((insert) => insert.id === createMixerInsertId(id) ? { ...insert, pan } : insert),
  })),
  updateChannelSteps: (id, steps) => set((state) => ({
    channels: updateChannelCollection(state.channels, id, (channel) => ({ ...channel, steps })),
  })),
  setChannelPreset: (id, preset) => set((state) => ({
    channels: updateChannelCollection(state.channels, id, (channel) => ({ ...channel, preset })),
  })),
  setChannelMixerInsert: (channelId, insertId) => set((state) => ({
    channels: updateChannelCollection(state.channels, channelId, (channel) => ({ ...channel, mixerInsertId: insertId })),
    mixerInserts: state.mixerInserts.map((insert) => ({
      ...insert,
      channelIds: insert.id === insertId
        ? Array.from(new Set([...insert.channelIds, channelId]))
        : insert.channelIds.filter((id) => id !== channelId),
    })),
  })),
  setMixerInsertVolume: (insertId, volume) => set((state) => ({
    mixerInserts: state.mixerInserts.map((insert) => insert.id === insertId ? { ...insert, volume } : insert),
    masterVolume: insertId === MASTER_INSERT_ID ? volume : state.masterVolume,
  })),
  setMixerInsertPan: (insertId, pan) => set((state) => ({
    mixerInserts: state.mixerInserts.map((insert) => insert.id === insertId ? { ...insert, pan } : insert),
  })),
  setMixerInsertName: (insertId, name) => set((state) => ({
    mixerInserts: state.mixerInserts.map((insert) => insert.id === insertId ? { ...insert, name } : insert),
  })),
  setMixerInsertFxSlot: (insertId, slotIndex, value) => set((state) => ({
    mixerInserts: state.mixerInserts.map((insert) => insert.id === insertId ? {
      ...insert,
      fxSlots: insert.fxSlots.map((slot, index) => index === slotIndex ? { ...slot, name: value, enabled: value !== 'Empty' } : slot),
    } : insert),
  })),
  setMixerFxParam: (insertId, slotIndex, key, value) => set((state) => ({
    mixerInserts: state.mixerInserts.map((insert) => insert.id === insertId ? {
      ...insert,
      fxSlots: insert.fxSlots.map((slot, index) => index === slotIndex ? { ...slot, [key]: value } : slot),
    } : insert),
  })),
  toggleMixerFxEnabled: (insertId, slotIndex) => set((state) => ({
    mixerInserts: state.mixerInserts.map((insert) => insert.id === insertId ? {
      ...insert,
      fxSlots: insert.fxSlots.map((slot, index) => index === slotIndex ? { ...slot, enabled: !slot.enabled } : slot),
    } : insert),
  })),
  setMixerSendTarget: (insertId, sendId, targetId) => set((state) => ({
    mixerInserts: state.mixerInserts.map((insert) => insert.id === insertId ? {
      ...insert,
      sends: insert.sends.map((send) => send.id === sendId ? { ...send, targetId } : send),
    } : insert),
  })),
  setMixerSendLevel: (insertId, sendId, level) => set((state) => ({
    mixerInserts: state.mixerInserts.map((insert) => insert.id === insertId ? {
      ...insert,
      sends: insert.sends.map((send) => send.id === sendId ? { ...send, level } : send),
    } : insert),
  })),
  addPlaylistClip: (patternId, row, start, length = 4) => set((state) => ({
    playlistClips: [...state.playlistClips, { id: createId(), clipType: 'pattern', patternId, row, start, length }],
    projectStatus: 'Playlist clip added',
  })),
  addAudioClip: (sampleId, row, start, length = 4) => set((state) => ({
    playlistClips: [...state.playlistClips, { id: createId(), clipType: 'audio', sampleId, row, start, length }],
    projectStatus: 'Audio clip added',
  })),
  addAutomationClip: (automationTarget, row, start, length = 4) => set((state) => ({
    playlistClips: [...state.playlistClips, { id: createId(), clipType: 'automation', automationTarget, row, start, length, automationPoints: defaultAutomationPoints() }],
    projectStatus: 'Automation clip added',
  })),
  setAutomationPoint: (clipId, pointId, x, value) => set((state) => ({
    playlistClips: state.playlistClips.map((clip) => clip.id === clipId ? {
      ...clip,
      automationPoints: (clip.automationPoints || []).map((point) => point.id === pointId ? { ...point, x: Math.min(1, Math.max(0, x)), value: Math.min(1, Math.max(0, value)) } : point).sort((a, b) => a.x - b.x),
    } : clip),
  })),
  addAutomationPoint: (clipId, x, value) => set((state) => ({
    playlistClips: state.playlistClips.map((clip) => clip.id === clipId ? {
      ...clip,
      automationPoints: [...(clip.automationPoints || []), { id: createId(), x: Math.min(1, Math.max(0, x)), value: Math.min(1, Math.max(0, value)) }].sort((a, b) => a.x - b.x),
    } : clip),
  })),
  removePlaylistClip: (clipId) => set((state) => ({
    playlistClips: state.playlistClips.filter((clip) => clip.id !== clipId),
    projectStatus: 'Playlist clip removed',
  })),
  movePlaylistClip: (clipId, row, start) => set((state) => ({
    playlistClips: state.playlistClips.map((clip) => clip.id === clipId ? { ...clip, row: Math.max(0, row), start: Math.max(0, start) } : clip),
  })),
  resizePlaylistClip: (clipId, length) => set((state) => ({
    playlistClips: state.playlistClips.map((clip) => clip.id === clipId ? { ...clip, length: Math.max(1, length) } : clip),
  })),
  clearPlaylist: () => set({ playlistClips: [], projectStatus: 'Playlist cleared' }),
  clearSteps: () => set((state) => {
    const channels = state.channels.map((channel) => ({ ...channel, steps: createEmptySteps(state.patternLength), notes: [] }));
    return {
      channels,
      patterns: syncSelectedPattern(state.patterns, state.selectedPatternId, channels, state.patternLength),
      projectStatus: 'Pattern cleared',
    };
  }),
  saveProject: () => {
    const projectData = get().getProjectData();
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projectData));
    set({ projectStatus: 'Project saved locally', lastSavedAt: Date.now() });
  },
  loadProject: () => {
    const data = localStorage.getItem(PROJECT_STORAGE_KEY);
    if (!data) {
      set({ projectStatus: 'No local save found' });
      return;
    }

    try {
      const normalized = normalizeProjectData(JSON.parse(data));
      set({
        bpm: normalized.bpm,
        patternLength: normalized.patternLength,
        transportMode: normalized.transportMode,
        selectedPatternId: normalized.selectedPatternId,
        selectedSampleId: normalized.selectedSampleId,
        presetFavorites: normalized.presetFavorites,
        songSections: normalized.songSections,
        channels: normalized.channels,
        patterns: normalized.patterns,
        sampleLibrary: normalized.sampleLibrary,
        playlistClips: normalized.playlistClips,
        mixerInserts: normalized.mixerInserts,
        selectedChannelId: normalized.channels[0]?.id ?? null,
        masterVolume: normalized.masterVolume,
        currentStep: 0,
        isPlaying: false,
        projectStatus: 'Project restored from local save',
        lastSavedAt: Date.now(),
      });
    } catch (error) {
      console.error('Failed to load project', error);
      set({ projectStatus: 'Saved project could not be loaded' });
    }
  },
  getProjectData: () => {
    const state = get();
    return {
      format: 'geminidaw-plugin-state' as const,
      formatVersion: 1 as const,
      pluginTargets: PLUGIN_TARGETS,
      bpm: state.bpm,
      patternLength: state.patternLength,
      transportMode: state.transportMode,
      selectedPatternId: state.selectedPatternId,
      selectedSampleId: state.selectedSampleId,
      presetFavorites: state.presetFavorites,
      songSections: state.songSections,
      channels: state.channels,
      patterns: syncSelectedPattern(state.patterns, state.selectedPatternId, state.channels, state.patternLength),
      sampleLibrary: state.sampleLibrary,
      playlistClips: state.playlistClips,
      mixerInserts: state.mixerInserts,
      masterVolume: state.masterVolume,
    };
  },
  importProjectData: (projectData) => {
    const normalized = normalizeProjectData(projectData);
    set({
      bpm: normalized.bpm,
      patternLength: normalized.patternLength,
      transportMode: normalized.transportMode,
      selectedPatternId: normalized.selectedPatternId,
      selectedSampleId: normalized.selectedSampleId,
      presetFavorites: normalized.presetFavorites,
      songSections: normalized.songSections,
      channels: normalized.channels,
      patterns: normalized.patterns,
      sampleLibrary: normalized.sampleLibrary,
      playlistClips: normalized.playlistClips,
      mixerInserts: normalized.mixerInserts,
      selectedChannelId: normalized.channels[0]?.id ?? null,
      masterVolume: normalized.masterVolume,
      currentStep: 0,
      isPlaying: false,
      projectStatus: 'Project imported from file',
      lastSavedAt: null,
    });
  },
}));
