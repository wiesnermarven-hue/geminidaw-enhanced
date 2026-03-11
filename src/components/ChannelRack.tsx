import { memo, useMemo } from 'react';
import { Plus, X, CircleDot, Star } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useDawStore, allSynths, defaultPresets, type Channel } from '../store';

const StepPlayheadOverlay = memo(({ patternLength }: { patternLength: number }) => {
  const currentStep = useDawStore((state) => state.currentStep);
  const displayStep = currentStep % patternLength;

  return (
    <div
      className="pointer-events-none absolute inset-y-0 z-10"
      style={{
        left: `calc(${(displayStep / patternLength) * 100}% + 1px)`,
        width: `calc(${100 / patternLength}% - 2px)`,
      }}
    >
      <div className="mx-auto h-full w-1 rounded-full bg-[var(--accent-green)]/65 shadow-[0_0_10px_rgba(154,217,79,0.55)]" />
    </div>
  );
});

type ChannelRowProps = {
  channel: Channel;
  patternLength: number;
  presetFavorites: string[];
  togglePresetFavorite: (synthType: Channel['synthType'], presetName: string) => void;
  toggleStep: (channelId: string, stepIndex: number) => void;
  updateChannelVolume: (id: string, volume: number) => void;
  updateChannelPan: (id: string, pan: number) => void;
  removeChannel: (id: string) => void;
  setChannelPreset: (id: string, preset: string) => void;
  setSelectedChannel: (id: string | null) => void;
  setView: (view: 'rack' | 'pianoRoll' | 'playlist' | 'mixer') => void;
};

const ChannelRow = memo(({
  channel,
  patternLength,
  presetFavorites,
  togglePresetFavorite,
  toggleStep,
  updateChannelVolume,
  updateChannelPan,
  removeChannel,
  setChannelPreset,
  setSelectedChannel,
  setView,
}: ChannelRowProps) => {
  const stepColumns = { gridTemplateColumns: `repeat(${patternLength}, minmax(0, 1fr))` };

  return (
    <div className="group flex items-center gap-2">
      <div className="relative flex h-11 w-72 items-center gap-1 rounded-sm border border-[#24292f] bg-[linear-gradient(180deg,#4a5159_0%,#3a4048_100%)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors group-hover:border-[#5c6570]">
        <div className="ml-1 h-5 w-1.5 rounded-sm bg-[var(--accent-green)] shadow-[0_0_6px_#9ad94f]" />

        <div className="relative ml-1 flex h-7 w-7 cursor-ns-resize items-center justify-center rounded-full border border-black/40 bg-[#252a30] shadow-inner">
          <div className="absolute top-0.5 h-2 w-1 rounded-full bg-[var(--text-1)]" style={{ transform: `rotate(${channel.pan * 45}deg)`, transformOrigin: 'bottom center' }} />
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={channel.pan}
            onChange={(e) => updateChannelPan(channel.id, Number(e.target.value))}
            className="absolute inset-0 cursor-ns-resize opacity-0"
          />
        </div>

        <div className="relative flex h-7 w-7 cursor-ns-resize items-center justify-center rounded-full border border-black/40 bg-[#252a30] shadow-inner">
          <div className="absolute top-0.5 h-2 w-1 rounded-full bg-[var(--text-1)]" style={{ transform: `rotate(${(channel.volume - 0.5) * 90}deg)`, transformOrigin: 'bottom center' }} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={channel.volume}
            onChange={(e) => updateChannelVolume(channel.id, Number(e.target.value))}
            className="absolute inset-0 cursor-ns-resize opacity-0"
          />
        </div>

        <div className="relative ml-1 flex h-full flex-1 items-center overflow-hidden rounded-sm border border-[#68717c] border-b-[#2f353d] bg-[linear-gradient(180deg,#69717b_0%,#5a626c_100%)] px-2 shadow-sm hover:bg-[#6e767e]">
          {channel.notes.length > 0 && (
            <div className="absolute right-0 top-0 h-0 w-0 border-r-[8px] border-t-[8px] border-r-[var(--accent-green)] border-t-transparent" title="Has Piano Roll Notes" />
          )}
          <div className="flex-1 overflow-hidden">
            <div className="truncate leading-tight text-xs font-semibold text-[var(--text-0)] drop-shadow-md">
              {channel.name}
            </div>
            <div className="text-[9px] uppercase tracking-[0.16em] text-white/55">{channel.synthType}</div>
            <select
              value={channel.preset}
              onChange={(e) => setChannelPreset(channel.id, e.target.value)}
              className="-ml-1 w-full cursor-pointer bg-transparent text-[9px] text-[var(--text-1)] outline-none"
            >
              {Object.keys(defaultPresets[channel.synthType]).map((p) => (
                <option key={p} value={p} className="bg-[#32373c]">{p}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => togglePresetFavorite(channel.synthType, channel.preset)}
            className="mr-1 rounded-sm p-1 text-[var(--text-2)] hover:bg-black/10 hover:text-[var(--accent-orange)]"
            title="Toggle preset favorite"
          >
            <Star size={11} fill={presetFavorites.includes(`${channel.synthType}::${channel.preset}`) ? 'currentColor' : 'none'} />
          </button>
          <div className="ml-1 h-5 w-2 shrink-0 rounded-sm border border-black/20" style={{ backgroundColor: channel.color }} />
        </div>

        <button
          onClick={() => { setSelectedChannel(channel.id); setView('pianoRoll'); }}
          className="ml-1 rounded-sm p-1 text-[var(--text-2)] transition-colors hover:bg-[#5a626a] hover:text-[var(--text-0)]"
          title="Piano Roll"
        >
          <CircleDot size={12} />
        </button>

        <button
          onClick={() => removeChannel(channel.id)}
          className="absolute -left-4 text-[var(--text-2)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[var(--accent-red)]"
        >
          <X size={12} />
        </button>
      </div>

      <div className="flex-1 px-1">
        <div className="relative">
          <StepPlayheadOverlay patternLength={patternLength} />
          <div className="grid items-center gap-[2px]" style={stepColumns}>
            {channel.steps.map((step, i) => {
              const isBeat = Math.floor(i / 4) % 2 === 0;
              return (
                <button
                  key={i}
                  onClick={() => toggleStep(channel.id, i)}
                  className={`
                    relative h-10 rounded-[3px] border-t border-l border-b-2 border-r-2 transition-all duration-75
                    ${step.isActive
                      ? 'border-t-white/40 border-l-white/40 border-b-black/40 border-r-black/40 shadow-[inset_0_0_8px_rgba(255,255,255,0.2)]'
                      : isBeat
                        ? 'bg-[#4a5158] border-t-[#606975] border-l-[#606975] border-b-[#2a2e33] border-r-[#2a2e33] hover:bg-[#56606a]'
                        : 'bg-[#333942] border-t-[#464f59] border-l-[#464f59] border-b-[#1e2226] border-r-[#1e2226] hover:bg-[#3d444d]'
                    }
                  `}
                  style={{ backgroundColor: step.isActive ? channel.color : undefined }}
                >
                  {step.isActive && (
                    <div className="absolute bottom-0.5 left-1/2 h-1 w-3 -translate-x-1/2 rounded-full bg-white/80 blur-[0.5px] shadow-[0_0_4px_white]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

export const ChannelRack = () => {
  const { channels, patternLength, presetFavorites, togglePresetFavorite, toggleStep, updateChannelVolume, updateChannelPan, addChannel, removeChannel, setChannelPreset, setSelectedChannel, setView } = useDawStore(useShallow((state) => ({
    channels: state.channels,
    patternLength: state.patternLength,
    presetFavorites: state.presetFavorites,
    togglePresetFavorite: state.togglePresetFavorite,
    toggleStep: state.toggleStep,
    updateChannelVolume: state.updateChannelVolume,
    updateChannelPan: state.updateChannelPan,
    addChannel: state.addChannel,
    removeChannel: state.removeChannel,
    setChannelPreset: state.setChannelPreset,
    setSelectedChannel: state.setSelectedChannel,
    setView: state.setView,
  })));
  const activeSteps = useMemo(() => channels.reduce((sum, channel) => sum + channel.steps.filter((step) => step.isActive).length, 0), [channels]);
  const stepColumns = useMemo(() => ({ gridTemplateColumns: `repeat(${patternLength}, minmax(0, 1fr))` }), [patternLength]);

  return (
    <div className="relative flex-1 overflow-auto bg-[radial-gradient(circle_at_top,#2b3038_0%,#20242a_65%)] p-4">
      <div className="mb-3 flex items-center justify-between rounded-sm border border-[var(--line-hard)] bg-[linear-gradient(180deg,#353b43_0%,#272c33_100%)] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[var(--text-2)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div>Channel rack</div>
        <div className="flex items-center gap-3">
          <span>{channels.length} channels</span>
          <span>{activeSteps} active steps</span>
        </div>
      </div>

      <div className="inline-block min-w-full overflow-hidden rounded-sm border border-[var(--line-hard)] bg-[linear-gradient(180deg,#333942_0%,#272c32_100%)] shadow-[0_16px_36px_rgba(0,0,0,0.32)]">
        <div className="flex items-center border-b border-[var(--line-hard)] bg-[linear-gradient(180deg,#3c434b_0%,#2b3137_100%)] p-1.5 h-10">
          <div className="w-72 pl-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-2)]">Channel rack</div>
          <div className="flex-1 px-1">
            <div className="grid gap-[2px]" style={stepColumns}>
            {Array.from({ length: patternLength }).map((_, i) => (
              <div key={i} className={`rounded-sm py-1 text-center text-[9px] font-bold ${i % 4 === 0 ? 'bg-[#23272d] text-[var(--text-1)]' : 'text-[var(--text-2)]'}`}>
                {String(i + 1).padStart(2, '0')}
              </div>
            ))}
            </div>
          </div>
        </div>

        <div className="border-b border-[var(--line-hard)] bg-[#24292f] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-2)]">
          Step sequencer lanes
        </div>

        <div className="space-y-[2px] bg-[#2c3137] p-1.5">
          {channels.map((channel) => (
            <ChannelRow
              key={channel.id}
              channel={channel}
              patternLength={patternLength}
              presetFavorites={presetFavorites}
              togglePresetFavorite={togglePresetFavorite}
              toggleStep={toggleStep}
              updateChannelVolume={updateChannelVolume}
              updateChannelPan={updateChannelPan}
              removeChannel={removeChannel}
              setChannelPreset={setChannelPreset}
              setSelectedChannel={setSelectedChannel}
              setView={setView}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-1 border-t border-[var(--line-hard)] bg-[linear-gradient(180deg,#30363d_0%,#23282e_100%)] p-2">
          {allSynths.map(type => (
            <button 
              key={type}
              onClick={() => addChannel(type)} 
              className="flex items-center gap-1 rounded-sm border border-[#20252a] bg-[linear-gradient(180deg,#4b535d_0%,#373d45_100%)] px-2 py-1 text-[10px] font-bold text-[var(--text-1)] transition-colors hover:bg-[#5a626a] hover:text-[var(--text-0)]"
            >
              <Plus size={10} /> {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
