import * as Tone from 'tone';
import { Channel, MASTER_INSERT_ID, MixerFxSlot, MixerInsert, defaultPresets, useDawStore } from '../store';

type ChannelSynth = Tone.Synth<any> | Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth | Tone.PolySynth;
type EffectNode = Tone.ToneAudioNode;

interface InsertGraph {
  input: Tone.Gain;
  pan: Tone.Panner;
  volume: Tone.Volume;
  output: Tone.Gain;
  effects: EffectNode[];
  fxSignature: string;
  sendGains: Record<string, Tone.Gain>;
}

const synths: Record<string, ChannelSynth> = {};
const channelPanners: Record<string, Tone.Panner> = {};
const channelVolumes: Record<string, Tone.Volume> = {};
const insertGraphs: Record<string, InsertGraph> = {};
const SONG_STEPS_PER_BAR = 4;

const sampleVoices = {
  drum: new Tone.MembraneSynth(),
  texture: new Tone.NoiseSynth({ envelope: { attack: 0.05, decay: 0.4, sustain: 0.15, release: 0.6 } }),
  fx: new Tone.MetalSynth({ envelope: { attack: 0.01, decay: 0.3, release: 0.2 }, harmonicity: 8.5, modulationIndex: 28, resonance: 2600, octaves: 1.5 }),
};

let isInitialized = false;
let midiAccess: MIDIAccess | null = null;

const disposeChannelAudio = (channelId: string) => {
  synths[channelId]?.dispose();
  channelPanners[channelId]?.dispose();
  channelVolumes[channelId]?.dispose();

  delete synths[channelId];
  delete channelPanners[channelId];
  delete channelVolumes[channelId];
};

const disposeInsertGraph = (insertId: string) => {
  const graph = insertGraphs[insertId];
  if (!graph) return;

  Object.values(graph.sendGains).forEach((gain) => gain.dispose());
  graph.effects.forEach((effect) => effect.dispose());
  graph.input.dispose();
  graph.pan.dispose();
  graph.volume.dispose();
  graph.output.dispose();
  delete insertGraphs[insertId];
};

const createEffectNode = (slot: MixerFxSlot): EffectNode | null => {
  const name = slot.name.trim().toLowerCase();
  if (!slot.enabled || !name || name === 'empty') return null;
  if (name.includes('reverb')) return new Tone.Freeverb({ roomSize: 0.4 + slot.tone * 0.5, dampening: 1400 + slot.tone * 2600, wet: slot.wet });
  if (name.includes('delay')) return new Tone.PingPongDelay({ delayTime: '8n', feedback: Math.min(0.8, 0.15 + slot.drive * 0.5), wet: slot.wet });
  if (name.includes('chorus')) {
    const chorus = new Tone.Chorus(4, 2.5, 0.25);
    chorus.start();
    chorus.wet.value = slot.wet;
    return chorus;
  }
  if (name.includes('dist') || name.includes('drive') || name.includes('satur')) return new Tone.Distortion({ distortion: Math.min(0.95, 0.15 + slot.drive * 0.8), wet: slot.wet });
  if (name.includes('filter')) return new Tone.Filter({ frequency: 300 + slot.tone * 5200, type: 'lowpass', rolloff: -24 });
  if (name.includes('limit')) return new Tone.Limiter(-1);
  if (name.includes('compress')) return new Tone.Compressor({ threshold: -24 + slot.drive * 18, ratio: 2 + slot.drive * 4 });
  if (name.includes('stereo')) return new Tone.StereoWidener({ width: slot.wet });
  return new Tone.EQ3({ low: (slot.tone - 0.5) * 8, mid: slot.drive * 4, high: slot.wet * 4 });
};

const ensureInsertGraph = (insert: MixerInsert) => {
  if (insertGraphs[insert.id]) return insertGraphs[insert.id];

  insertGraphs[insert.id] = {
    input: new Tone.Gain(1),
    pan: new Tone.Panner(0),
    volume: new Tone.Volume(0),
    output: new Tone.Gain(1),
    effects: [],
    fxSignature: '',
    sendGains: {},
  };

  return insertGraphs[insert.id];
};

const rebuildInsertEffects = (insert: MixerInsert, graph: InsertGraph) => {
  const fxSignature = insert.fxSlots.map((slot) => `${slot.name}:${slot.enabled}:${slot.wet}:${slot.tone}:${slot.drive}`).join('|');
  if (graph.fxSignature === fxSignature) return;

  graph.input.disconnect();
  graph.pan.disconnect();
  graph.volume.disconnect();
  graph.effects.forEach((effect) => effect.dispose());
  graph.effects = insert.fxSlots.map(createEffectNode).filter(Boolean) as EffectNode[];
  graph.fxSignature = fxSignature;

  graph.input.connect(graph.pan);
  if (graph.effects.length === 0) {
    graph.pan.connect(graph.volume);
  } else {
    graph.pan.chain(...graph.effects, graph.volume);
  }
  graph.volume.connect(graph.output);
};

const syncInsertGraph = (insert: MixerInsert) => {
  const graph = ensureInsertGraph(insert);
  rebuildInsertEffects(insert, graph);
  graph.pan.pan.rampTo(insert.pan, 0.05);
  graph.volume.volume.rampTo(Tone.gainToDb(insert.volume), 0.05);
  return graph;
};

const reconnectInsertRouting = (mixerInserts: MixerInsert[]) => {
  mixerInserts.forEach((insert) => {
    const graph = syncInsertGraph(insert);
    graph.output.disconnect();
    Object.values(graph.sendGains).forEach((gain) => {
      gain.disconnect();
      gain.dispose();
    });
    graph.sendGains = {};
  });

  mixerInserts.forEach((insert) => {
    const graph = insertGraphs[insert.id];
    if (!graph) return;

    if (insert.id === MASTER_INSERT_ID) {
      graph.output.connect(Tone.Destination);
      return;
    }

    insert.sends.forEach((send) => {
      const targetGraph = insertGraphs[send.targetId];
      if (!targetGraph) return;
      const gain = new Tone.Gain(send.level);
      graph.output.connect(gain);
      gain.connect(targetGraph.input);
      graph.sendGains[send.id] = gain;
    });
  });
};

const reconnectChannelRouting = (channels: Channel[]) => {
  channels.forEach((channel) => {
    const graph = insertGraphs[channel.mixerInsertId] || insertGraphs[MASTER_INSERT_ID];
    const panner = channelPanners[channel.id];
    const volume = channelVolumes[channel.id];
    if (!graph || !panner || !volume) return;

    panner.disconnect();
    volume.disconnect();
    panner.connect(volume);
    volume.connect(graph.input);
  });
};

const syncMixerGraph = (state = useDawStore.getState()) => {
  const currentInsertIds = new Set(state.mixerInserts.map((insert) => insert.id));

  state.mixerInserts.forEach(syncInsertGraph);

  Object.keys(insertGraphs).forEach((insertId) => {
    if (!currentInsertIds.has(insertId)) {
      disposeInsertGraph(insertId);
    }
  });

  reconnectInsertRouting(state.mixerInserts);
  reconnectChannelRouting(state.channels);
  const masterInput = insertGraphs[MASTER_INSERT_ID]?.input;
  if (masterInput) {
    Object.values(sampleVoices).forEach((voice) => {
      voice.disconnect();
      voice.connect(masterInput);
    });
  }
};

const getSongLengthSteps = (state = useDawStore.getState()) => {
  const maxBar = state.playlistClips.reduce((max, clip) => Math.max(max, clip.start + clip.length), 0);
  return Math.max(state.patternLength, maxBar * SONG_STEPS_PER_BAR || state.patternLength);
};

const getAutomationValue = (points: { x: number; value: number }[], progress: number) => {
  if (points.length === 0) return 0;
  const sorted = [...points].sort((a, b) => a.x - b.x);
  if (progress <= sorted[0].x) return sorted[0].value;
  if (progress >= sorted[sorted.length - 1].x) return sorted[sorted.length - 1].value;

  for (let index = 0; index < sorted.length - 1; index += 1) {
    const left = sorted[index];
    const right = sorted[index + 1];
    if (progress >= left.x && progress <= right.x) {
      const ratio = (progress - left.x) / Math.max(0.0001, right.x - left.x);
      return left.value + (right.value - left.value) * ratio;
    }
  }

  return sorted[sorted.length - 1].value;
};

const triggerSampleClip = (sampleId: string, time: number) => {
  const sample = useDawStore.getState().sampleLibrary.find((entry) => entry.id === sampleId);
  if (!sample) return;
  if (sample.kind === 'drum') sampleVoices.drum.triggerAttackRelease('C1', '8n', time);
  if (sample.kind === 'texture') sampleVoices.texture.triggerAttackRelease('8n', time, 0.35);
  if (sample.kind === 'fx') sampleVoices.fx.triggerAttackRelease('16n', time, 0.25);
};

const runSongStep = (songStep: number, time: number) => {
  const state = useDawStore.getState();
  const channelMap = new Map(state.channels.map((channel) => [channel.id, channel]));
  const patternMap = new Map(state.patterns.map((pattern) => [pattern.id, pattern]));

  state.playlistClips.forEach((clip) => {
    const clipStartStep = clip.start * SONG_STEPS_PER_BAR;
    const clipEndStep = clipStartStep + clip.length * SONG_STEPS_PER_BAR;
    if (songStep < clipStartStep || songStep >= clipEndStep) return;

    if (clip.clipType === 'pattern' && clip.patternId) {
      const pattern = patternMap.get(clip.patternId);
      if (!pattern) return;
      const localStep = (songStep - clipStartStep) % pattern.length;
      pattern.channels.forEach((patternChannel) => {
        const channel = channelMap.get(patternChannel.channelId);
        if (!channel) return;
        if (patternChannel.steps[localStep]?.isActive) playSynth(channel.id, channel.synthType, time);
        patternChannel.notes.filter((note) => note.step === localStep).forEach((note) => {
          playSynth(channel.id, channel.synthType, time, note.pitch, note.duration);
        });
      });
      return;
    }

    if (clip.clipType === 'audio' && clip.sampleId && songStep === clipStartStep) {
      triggerSampleClip(clip.sampleId, time);
    }
  });

  const activeAutomation = state.playlistClips.filter((clip) => clip.clipType === 'automation' && clip.automationTarget && clip.automationPoints?.length).filter((clip) => {
    const clipStartStep = clip.start * SONG_STEPS_PER_BAR;
    const clipEndStep = clipStartStep + clip.length * SONG_STEPS_PER_BAR;
    return songStep >= clipStartStep && songStep < clipEndStep;
  });

  const bpmClip = activeAutomation.find((clip) => clip.automationTarget === 'bpm');
  const volumeClip = activeAutomation.find((clip) => clip.automationTarget === 'masterVolume');

  if (bpmClip?.automationPoints?.length) {
    const progress = (songStep - bpmClip.start * SONG_STEPS_PER_BAR) / Math.max(1, bpmClip.length * SONG_STEPS_PER_BAR - 1);
    const value = getAutomationValue(bpmClip.automationPoints, progress);
    Tone.Transport.bpm.rampTo(80 + value * 120, 0.05);
  } else {
    Tone.Transport.bpm.rampTo(state.bpm, 0.05);
  }

  const masterGraph = insertGraphs[MASTER_INSERT_ID];
  if (masterGraph) {
    if (volumeClip?.automationPoints?.length) {
      const progress = (songStep - volumeClip.start * SONG_STEPS_PER_BAR) / Math.max(1, volumeClip.length * SONG_STEPS_PER_BAR - 1);
      const value = getAutomationValue(volumeClip.automationPoints, progress);
      masterGraph.volume.volume.rampTo(Tone.gainToDb(Math.max(0.01, value)), 0.05);
    } else {
      masterGraph.volume.volume.rampTo(Tone.gainToDb(state.masterVolume), 0.05);
    }
  }
};

const createSynthForChannel = (channel: Channel) => {
  let synth: ChannelSynth;
  const params = defaultPresets[channel.synthType][channel.preset] || defaultPresets[channel.synthType].Default;

  switch (channel.synthType) {
    case '808 Kick':
      synth = new Tone.MembraneSynth(params);
      break;
    case '808 Snare':
      synth = new Tone.NoiseSynth(params);
      break;
    case '808 Closed Hat':
    case '808 Open Hat':
      synth = new Tone.MetalSynth(params);
      break;
    case '808 Clap':
      synth = new Tone.NoiseSynth(params);
      break;
    case '808 Cowbell':
    case 'Synth':
    case 'FM Lead':
      synth = new Tone.PolySynth(Tone.Synth, params);
      break;
    default:
      synth = new Tone.Synth();
  }

  const panner = new Tone.Panner(channel.pan);
  const volume = new Tone.Volume(Tone.gainToDb(channel.volume));
  synth.connect(panner);
  panner.connect(volume);

  synths[channel.id] = synth;
  channelPanners[channel.id] = panner;
  channelVolumes[channel.id] = volume;
};

const playSynth = (id: string, type: string, time: number, customPitch?: string, customDuration?: string) => {
  const synth = synths[id];
  if (!synth) return;

  const duration = customDuration || '16n';
  switch (type) {
    case '808 Kick':
      (synth as Tone.MembraneSynth).triggerAttackRelease(customPitch || 'C1', duration, time);
      break;
    case '808 Snare':
      (synth as Tone.NoiseSynth).triggerAttackRelease(duration, time);
      break;
    case '808 Closed Hat':
      (synth as Tone.MetalSynth).triggerAttackRelease(duration, time, 0.3);
      break;
    case '808 Open Hat':
      (synth as Tone.MetalSynth).triggerAttackRelease(customDuration || '8n', time, 0.3);
      break;
    case '808 Clap':
      (synth as Tone.NoiseSynth).triggerAttackRelease(duration, time);
      break;
    case '808 Cowbell':
      (synth as Tone.PolySynth).triggerAttackRelease(customPitch ? [customPitch] : ['G4', 'F#4'], duration, time);
      break;
    case 'Synth':
    case 'FM Lead':
      (synth as Tone.PolySynth).triggerAttackRelease(customPitch || 'C4', duration, time);
      break;
  }
};

const updateMidiInputs = () => {
  if (!midiAccess) return;
  const inputs = Array.from(midiAccess.inputs.values()).map((input) => input.name || 'Unknown Device');
  useDawStore.getState().setMidiInputs(inputs);
};

const handleMidiMessage = (event: any) => {
  const [status, note, velocity] = event.data;
  const command = status & 0xf0;

  if (command === 0x90 && velocity > 0) {
    const pitch = Tone.Frequency(note, 'midi').toNote();
    const state = useDawStore.getState();
    const channel = state.channels.find((entry) => entry.id === state.selectedChannelId);
    if (channel) playSynth(channel.id, channel.synthType, Tone.now(), pitch);
  }

  if (command === 0x80 || (command === 0x90 && velocity === 0)) {
    const state = useDawStore.getState();
    const synth = state.selectedChannelId ? synths[state.selectedChannelId] : null;
    if (synth && (synth as any).triggerRelease) {
      (synth as any).triggerRelease(Tone.Frequency(note, 'midi').toNote(), Tone.now());
    }
  }
};

export const initAudio = async () => {
  if (isInitialized) return;

  await Tone.start();
  const state = useDawStore.getState();
  Tone.Transport.bpm.value = state.bpm;

  state.channels.forEach((channel) => {
    if (!synths[channel.id]) createSynthForChannel(channel);
  });
  syncMixerGraph(state);

  if (navigator.requestMIDIAccess) {
    try {
      midiAccess = await navigator.requestMIDIAccess();
      updateMidiInputs();
      midiAccess.onstatechange = updateMidiInputs;
      useDawStore.getState().setMidiError(null);
    } catch (error: any) {
      console.error('MIDI access denied', error);
      let errorMsg = 'MIDI access denied.';
      if (navigator.userAgent.includes('Firefox')) {
        errorMsg += ' Firefox requires a WebMIDI add-on or setting about:config "dom.webmidi.enabled" to true.';
      }
      useDawStore.getState().setMidiError(errorMsg);
    }
  } else {
    useDawStore.getState().setMidiError('Web MIDI is not supported in this browser.');
  }

  Tone.Transport.scheduleRepeat((time) => {
    const currentState = useDawStore.getState();
    const currentStep = currentState.currentStep;

    if (currentState.transportMode === 'song') {
      runSongStep(currentStep, time);
    } else {
      currentState.channels.forEach((channel) => {
        const patternStep = currentStep % currentState.patternLength;
        if (channel.steps[patternStep]?.isActive) {
          playSynth(channel.id, channel.synthType, time);
        }
        channel.notes.filter((note) => note.step === patternStep).forEach((note) => {
          playSynth(channel.id, channel.synthType, time, note.pitch, note.duration);
        });
      });
      Tone.Transport.bpm.rampTo(currentState.bpm, 0.05);
      const masterGraph = insertGraphs[MASTER_INSERT_ID];
      if (masterGraph) masterGraph.volume.volume.rampTo(Tone.gainToDb(currentState.masterVolume), 0.05);
    }

    Tone.Draw.schedule(() => {
      const loopLength = currentState.transportMode === 'song' ? getSongLengthSteps(currentState) : currentState.patternLength;
      useDawStore.getState().setCurrentStep((currentStep + 1) % Math.max(1, loopLength));
    }, time);
  }, '16n');

  isInitialized = true;
};

export const updateAudioState = async () => {
  const state = useDawStore.getState();
  Tone.Transport.bpm.value = state.bpm;

  if (state.isPlaying) {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    Tone.Transport.start();
  } else {
    Tone.Transport.stop();
    useDawStore.getState().setCurrentStep(0);
  }
};

useDawStore.subscribe((state, prevState) => {
  if (state.isPlaying !== prevState.isPlaying || state.bpm !== prevState.bpm) {
    updateAudioState();
  }

  if (state.selectedMidiInput !== prevState.selectedMidiInput && midiAccess) {
    midiAccess.inputs.forEach((input) => {
      input.onmidimessage = null;
    });

    if (state.selectedMidiInput) {
      const input = Array.from(midiAccess.inputs.values()).find((entry) => entry.name === state.selectedMidiInput);
      if (input) input.onmidimessage = handleMidiMessage;
    }
  }

  const previousChannelMap = new Map(prevState.channels.map((channel) => [channel.id, channel]));
  const currentChannelIds = new Set(state.channels.map((channel) => channel.id));

  state.channels.forEach((channel) => {
    const prevChannel = previousChannelMap.get(channel.id);
    if (!synths[channel.id]) createSynthForChannel(channel);
    if (channelVolumes[channel.id] && prevChannel && channel.volume !== prevChannel.volume) {
      channelVolumes[channel.id].volume.rampTo(Tone.gainToDb(channel.volume), 0.05);
    }
    if (channelPanners[channel.id] && prevChannel && channel.pan !== prevChannel.pan) {
      channelPanners[channel.id].pan.rampTo(channel.pan, 0.05);
    }
    if (synths[channel.id] && prevChannel && (channel.preset !== prevChannel.preset || channel.synthType !== prevChannel.synthType)) {
      disposeChannelAudio(channel.id);
      createSynthForChannel(channel);
    }
  });

  prevState.channels.forEach((channel) => {
    if (!currentChannelIds.has(channel.id)) disposeChannelAudio(channel.id);
  });

  if (state.channels !== prevState.channels || state.mixerInserts !== prevState.mixerInserts || state.masterVolume !== prevState.masterVolume) {
    syncMixerGraph(state);
  }
});
