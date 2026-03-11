import { memo, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { chordProgressionPresets, melodicSynths, useDawStore } from '../store';

const NOTES = ['C5', 'B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4', 'C4', 'B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3', 'E3', 'D#3', 'D3', 'C#3', 'C3'];

const PianoRollPlayhead = memo(({ patternLength }: { patternLength: number }) => {
  const currentStep = useDawStore((state) => state.currentStep);
  const displayStep = currentStep % patternLength;

  return (
    <div
      className="pointer-events-none absolute bottom-0 top-8 z-10 w-12 border-l border-white/20 bg-white/5"
      style={{ left: `${(displayStep / patternLength) * 100}%`, width: `${100 / patternLength}%` }}
    />
  );
});

export const PianoRoll = () => {
  const { channels, selectedChannelId, patternLength, addNote, removeNote, setSelectedChannel, generateChordProgression } = useDawStore(useShallow((state) => ({
    channels: state.channels,
    selectedChannelId: state.selectedChannelId,
    patternLength: state.patternLength,
    addNote: state.addNote,
    removeNote: state.removeNote,
    setSelectedChannel: state.setSelectedChannel,
    generateChordProgression: state.generateChordProgression,
  })));
  const [progressionId, setProgressionId] = useState(chordProgressionPresets[0]?.id ?? '');
  
  // Auto-select first channel if none selected
  useEffect(() => {
    if (!selectedChannelId && channels.length > 0) {
      setSelectedChannel(channels[0].id);
    }
  }, [selectedChannelId, channels, setSelectedChannel]);

  const channel = channels.find(c => c.id === selectedChannelId);
  const canGenerateChords = Boolean(channel && melodicSynths.includes(channel.synthType));
  const noteLookup = useMemo(() => {
    if (!channel) {
      return new Map<string, string>();
    }

    return new Map(channel.notes.map((note) => [`${note.pitch}:${note.step}`, note.id]));
  }, [channel]);
  const stepColumns = useMemo(() => ({ gridTemplateColumns: `repeat(${patternLength}, minmax(0, 1fr))` }), [patternLength]);

  if (!channel) return (
    <div className="flex-1 bg-[#2b3035] p-4 flex items-center justify-center">
      <p className="text-[#a2aab2] font-mono">No channels available</p>
    </div>
  );

  return (
    <div className="relative flex flex-1 flex-col overflow-auto bg-[radial-gradient(circle_at_top,#2b3038_0%,#20242a_65%)] p-4">
      <div className="mb-3 flex items-center justify-between rounded-sm border border-[var(--line-hard)] bg-[linear-gradient(180deg,#353b43_0%,#272c33_100%)] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-2)]">Piano roll</div>
          <div className="text-xs text-[var(--text-1)]">Channel editor and note grid</div>
        </div>
        <div className="flex items-center gap-2">
          {canGenerateChords && (
            <>
              <select
                value={progressionId}
                onChange={(e) => setProgressionId(e.target.value)}
                className="cursor-pointer rounded-sm border border-black/40 bg-[#23272d] px-2 py-1 text-xs font-bold text-[var(--text-0)] outline-none"
              >
                {chordProgressionPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>{preset.name}</option>
                ))}
              </select>
              <button
                onClick={() => generateChordProgression(channel.id, progressionId)}
                className="rounded-sm border border-[#355066] bg-[linear-gradient(180deg,#32414f_0%,#24303b_100%)] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--accent-blue)] transition-colors hover:border-[#5b89ad] hover:text-[var(--text-0)]"
              >
                Write Chords
              </button>
            </>
          )}
        <select 
          value={channel.id}
          onChange={(e) => setSelectedChannel(e.target.value)}
          className="cursor-pointer rounded-sm border border-black/40 bg-[#23272d] px-2 py-1 text-xs font-bold text-[var(--text-0)] outline-none"
        >
          {channels.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
          <div className="rounded-sm border border-black/40 bg-[#23272d] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-2)]">
            {channel.notes.length} notes
          </div>
        </div>
      </div>
      {canGenerateChords && (
        <div className="mb-3 rounded-sm border border-[var(--line-hard)] bg-[linear-gradient(180deg,#343a42_0%,#262b32_100%)] px-3 py-2 text-xs text-[var(--text-1)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          One-click progression writer for quick sketching. It rewrites the selected synth lane with stacked chords sized to the current pattern length.
        </div>
      )}
      <div className="flex flex-1 overflow-auto rounded-sm border border-[var(--line-hard)] bg-[linear-gradient(180deg,#31363d_0%,#262b31_100%)] shadow-[0_16px_36px_rgba(0,0,0,0.32)] relative">
        <div className="sticky left-0 z-30 w-20 shrink-0 border-r border-[var(--line-hard)] bg-[linear-gradient(180deg,#373d45_0%,#292e35_100%)]">
          <div className="flex h-8 items-center justify-end border-b border-[var(--line-hard)] px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-2)]">
            Keys
          </div>
          {NOTES.map(note => {
            const isBlack = note.includes('#');
            return (
              <div 
                key={note} 
                className={`flex h-6 items-center justify-end border-b border-[#1e2226] pr-2 text-[9px] font-bold
                  ${isBlack ? 'bg-[#1f2429] text-[#747d88]' : 'bg-[#c9ced3] text-[#2f343b]'}
                `}
              >
                {note}
              </div>
            );
          })}
        </div>

        <div className="relative min-w-[800px] flex-1">
          <div className="sticky top-0 z-20 border-b border-[var(--line-hard)] bg-[linear-gradient(180deg,#3a4149_0%,#2b3138_100%)] px-2 py-1">
            <div className="grid gap-[2px]" style={stepColumns}>
              {Array.from({ length: patternLength }).map((_, step) => {
                const major = step % 4 === 0;
                return (
                  <div key={step} className={`rounded-sm py-1 text-center text-[9px] font-bold ${major ? 'bg-[#22272d] text-[var(--text-1)]' : 'text-[var(--text-2)]'}`}>
                    {step + 1}
                  </div>
                );
              })}
            </div>
          </div>

          <PianoRollPlayhead patternLength={patternLength} />

          {NOTES.map(note => {
            const isBlack = note.includes('#');
            return (
              <div key={note} className={`flex h-6 border-b border-[#1e2226]/80 ${isBlack ? 'bg-[#23282d]' : 'bg-[#2b3137]'}`}>
                {Array.from({ length: patternLength }).map((_, step) => {
                  const isBeat = Math.floor(step / 4) % 2 === 0;
                  const existingNoteId = noteLookup.get(`${note}:${step}`);
                  
                  return (
                    <div 
                      key={step}
                      onClick={() => existingNoteId ? removeNote(channel.id, existingNoteId) : addNote(channel.id, note, step)}
                      className={`relative flex-1 cursor-crosshair border-r border-[#1e2226]/70 hover:bg-white/5
                        ${isBeat ? 'bg-black/10' : 'bg-white/[0.02]'}
                      `}
                    >
                      {existingNoteId && (
                        <div 
                          className="absolute inset-y-[2px] left-0 right-0 z-10 rounded-[2px] border border-black/40 shadow-sm"
                          style={{ backgroundColor: channel.color || '#8dc63f' }}
                        >
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/30 rounded-t-[2px]" />
                          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/20 rounded-b-[2px]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
