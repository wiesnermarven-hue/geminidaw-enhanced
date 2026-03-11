import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Volume2, Zap, WandSparkles } from 'lucide-react';
import { MASTER_INSERT_ID, useDawStore } from '../store';
import { AIMixMaster } from '../modules/aiMixMaster';

const createMeterHeights = (volume: number, pan: number) => {
  const base = Math.max(8, Math.round(volume * 100));
  const left = `${Math.max(10, Math.min(100, base * (pan <= 0 ? 1 : 1 - pan * 0.45)))}%`;
  const right = `${Math.max(10, Math.min(100, base * (pan >= 0 ? 1 : 1 + pan * 0.45)))}%`;
  return { left, right };
};

export const Mixer = () => {
  const {
    channels,
    mixerInserts,
    setChannelMixerInsert,
    setMixerInsertName,
    setMixerInsertVolume,
    setMixerInsertPan,
    setMixerInsertFxSlot,
    setMixerFxParam,
    toggleMixerFxEnabled,
    setMixerSendTarget,
    setMixerSendLevel,
  } = useDawStore(useShallow((state) => ({
    channels: state.channels,
    mixerInserts: state.mixerInserts,
    setChannelMixerInsert: state.setChannelMixerInsert,
    setMixerInsertName: state.setMixerInsertName,
    setMixerInsertVolume: state.setMixerInsertVolume,
    setMixerInsertPan: state.setMixerInsertPan,
    setMixerInsertFxSlot: state.setMixerInsertFxSlot,
    setMixerFxParam: state.setMixerFxParam,
    toggleMixerFxEnabled: state.toggleMixerFxEnabled,
    setMixerSendTarget: state.setMixerSendTarget,
    setMixerSendLevel: state.setMixerSendLevel,
  })));

  const insertOptions = useMemo(() => mixerInserts.map((insert) => ({ id: insert.id, name: insert.name })), [mixerInserts]);

  return (
    <div className="relative flex flex-1 flex-col overflow-auto bg-[radial-gradient(circle_at_top,#2b3038_0%,#20242a_65%)] p-4">
      <div className="mb-3 rounded-sm border border-[var(--line-hard)] bg-[linear-gradient(180deg,#353b43_0%,#272c33_100%)] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-2)]">Mixer</div>
          <div className="text-xs text-[var(--text-1)]">Routing, sends, insert FX slots, and master bus</div>
        </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                const suggestions = AIMixMaster.autoBalanceLevels(channels);
                suggestions.forEach(sug => setMixerInsertFxSlot(sug.insertId, sug.slotIndex, sug.fxName));
              }}
              className="flex items-center gap-1 rounded-sm bg-[var(--accent-green)] px-2 py-1 text-xs font-bold text-[#1f252a] hover:bg-[var(--accent-green-dark)]"
            >
              <Zap size={12} />
              Auto Mix
            </button>
            <button
              onClick={() => {
                const master = mixerInserts.find(insert => insert.isMaster);
                if (master) {
                  const suggestion = AIMixMaster.loudnessMaster(master);
                  setMixerInsertFxSlot(suggestion.insertId, suggestion.slotIndex, suggestion.fxName);
                }
              }}
              className="flex items-center gap-1 rounded-sm bg-[var(--accent-purple)] px-2 py-1 text-xs font-bold text-[#1f252a] hover:bg-[var(--accent-purple-dark)]"
            >
              <WandSparkles size={12} />
              Auto Master
            </button>
            <button
              onClick={() => {
                const suggestions = AIMixMaster.quantumReverb(channels);
                suggestions.forEach(sug => setMixerInsertFxSlot(sug.insertId, sug.slotIndex, sug.fxName));
              }}
              className="flex items-center gap-1 rounded-sm bg-[var(--accent-blue)] px-2 py-1 text-xs font-bold text-[#1f252a] hover:bg-[var(--accent-blue-dark)]"
            >
              Quantum Reverb
            </button>
            <button
              onClick={() => {
                const suggestions = AIMixMaster.holographicPanning(channels);
                suggestions.forEach(sug => setMixerInsertFxSlot(sug.insertId, sug.slotIndex, sug.fxName));
              }}
              className="flex items-center gap-1 rounded-sm bg-[var(--accent-green)] px-2 py-1 text-xs font-bold text-[#1f252a] hover:bg-[var(--accent-green-dark)]"
            >
              Holographic Pan
            </button>
          </div>
        </div>

      <div className="mb-3 overflow-auto rounded-sm border border-[var(--line-hard)] bg-[linear-gradient(180deg,#31363d_0%,#262b31_100%)] p-3 shadow-[0_16px_36px_rgba(0,0,0,0.32)]">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-2)]">Channel to insert routing</div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {channels.map((channel) => (
            <div key={channel.id} className="rounded-sm border border-[#20252a] bg-[linear-gradient(180deg,#454d56_0%,#2e343c_100%)] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-2)]">Channel</div>
                  <div className="text-xs font-semibold text-[var(--text-0)]">{channel.name}</div>
                </div>
                <div className="h-5 w-1.5 rounded-full" style={{ backgroundColor: channel.color }} />
              </div>
              <select
                value={channel.mixerInsertId}
                onChange={(event) => setChannelMixerInsert(channel.id, event.target.value)}
                className="w-full rounded-sm border border-black/40 bg-[#1f2429] px-2 py-1 text-xs text-[var(--text-0)] outline-none"
              >
                {insertOptions.filter((insert) => insert.id !== MASTER_INSERT_ID).map((insert) => (
                  <option key={insert.id} value={insert.id}>{insert.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-w-max gap-3 overflow-auto rounded-sm border border-[var(--line-hard)] bg-[linear-gradient(180deg,#31363d_0%,#262b31_100%)] p-3 shadow-[0_16px_36px_rgba(0,0,0,0.32)]">
        {mixerInserts.map((insert, index) => {
          const meter = createMeterHeights(insert.volume, insert.pan);

          return (
            <div
              key={insert.id}
              className={`flex w-72 shrink-0 flex-col rounded-sm border border-[#20252a] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${insert.id === MASTER_INSERT_ID ? 'bg-[linear-gradient(180deg,#5a6067_0%,#343a42_100%)]' : 'bg-[linear-gradient(180deg,#4a5159_0%,#2e343c_100%)]'}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-2)]">{insert.id === MASTER_INSERT_ID ? 'Master' : `Insert ${index + 1}`}</div>
                  <input
                    value={insert.name}
                    onChange={(event) => setMixerInsertName(insert.id, event.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-[var(--text-0)] outline-none"
                  />
                </div>
                <div className="h-6 w-1.5 rounded-full" style={{ backgroundColor: insert.color }} />
              </div>

              <div className="mb-3 flex h-32 items-end justify-center gap-1 rounded-sm border border-black/30 bg-[#1f2429] p-2 shadow-inner">
                <div className="w-4 rounded-t-sm bg-[linear-gradient(180deg,#d7ff7b_0%,#8cd345_60%,#4f7d26_100%)]" style={{ height: meter.left }} />
                <div className="w-4 rounded-t-sm bg-[linear-gradient(180deg,#d7ff7b_0%,#8cd345_60%,#4f7d26_100%)]" style={{ height: meter.right }} />
              </div>

              <div className="mb-2 grid grid-cols-2 gap-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-2)]">
                  Pan
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={insert.pan}
                    onChange={(event) => setMixerInsertPan(insert.id, Number(event.target.value))}
                    className="mt-1 h-1 w-full accent-[var(--accent-orange)]"
                  />
                </label>
                <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-2)]">
                  Volume
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={insert.volume}
                    onChange={(event) => setMixerInsertVolume(insert.id, Number(event.target.value))}
                    className="mt-1 h-1 w-full accent-[var(--accent-green)]"
                  />
                </label>
              </div>

              {insert.id !== MASTER_INSERT_ID && (
                <div className="mb-2 rounded-sm border border-black/30 bg-[#1f2429] p-2">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-2)]">Side-Chain Compression</div>
                  <div className="flex items-center gap-2">
                    <select className="rounded-sm border border-black/40 bg-[#2a3037] px-2 py-1 text-xs text-[var(--text-0)] outline-none">
                      <option value="none">No Source</option>
                      <option value="kick">Kick Channel</option>
                      <option value="snare">Snare Channel</option>
                      {/* Add more options */}
                    </select>
                    <button className="rounded-sm bg-[#2a3037] px-2 py-1 text-xs text-[var(--text-1)] hover:bg-[var(--accent-blue)]">
                      Enable
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-2)]">FX Slots</div>
              <div className="mb-3 space-y-1">
                {insert.fxSlots.map((slot, slotIndex) => (
                  <div key={slot.id} className="rounded-sm border border-black/30 bg-[#1f2429] p-2">
                    <div className="mb-2 flex items-center gap-2">
                      <button onClick={() => toggleMixerFxEnabled(insert.id, slotIndex)} className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase ${slot.enabled ? 'bg-[var(--accent-green)] text-[#1f252a]' : 'bg-[#2a3037] text-[var(--text-2)]'}`}>
                        {slot.enabled ? 'On' : 'Off'}
                      </button>
                      <input
                        value={slot.name}
                        onChange={(event) => setMixerInsertFxSlot(insert.id, slotIndex, event.target.value)}
                        className="w-full bg-transparent text-xs text-[var(--text-0)] outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-2)]">
                      <label>Wet<input type="range" min="0" max="1" step="0.01" value={slot.wet} onChange={(event) => setMixerFxParam(insert.id, slotIndex, 'wet', Number(event.target.value))} className="mt-1 h-1 w-full accent-[var(--accent-blue)]" /></label>
                      <label>Tone<input type="range" min="0" max="1" step="0.01" value={slot.tone} onChange={(event) => setMixerFxParam(insert.id, slotIndex, 'tone', Number(event.target.value))} className="mt-1 h-1 w-full accent-[var(--accent-orange)]" /></label>
                      <label>Drive<input type="range" min="0" max="1" step="0.01" value={slot.drive} onChange={(event) => setMixerFxParam(insert.id, slotIndex, 'drive', Number(event.target.value))} className="mt-1 h-1 w-full accent-[var(--accent-green)]" /></label>
                    </div>
                  </div>
                ))}
              </div>

              {insert.id !== MASTER_INSERT_ID && (
                <>
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-2)]">Sends</div>
                  <div className="space-y-2">
                    {insert.sends.map((send, sendIndex) => (
                      <div key={send.id} className="rounded-sm border border-black/30 bg-[#1f2429] p-2">
                        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-2)]">Send {sendIndex + 1}</div>
                        <select
                          value={send.targetId}
                          onChange={(event) => setMixerSendTarget(insert.id, send.id, event.target.value)}
                          className="mb-2 w-full rounded-sm border border-black/40 bg-[#2a3037] px-2 py-1 text-xs text-[var(--text-0)] outline-none"
                        >
                          {insertOptions.filter((option) => option.id !== insert.id).map((option) => (
                            <option key={option.id} value={option.id}>{option.name}</option>
                          ))}
                        </select>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={send.level}
                          onChange={(event) => setMixerSendLevel(insert.id, send.id, Number(event.target.value))}
                          className="h-1 w-full accent-[var(--accent-blue)]"
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {insert.id === MASTER_INSERT_ID && (
                <div className="mt-auto rounded-sm border border-black/30 bg-[#1f2429] p-2 text-xs text-[var(--text-1)]">
                  <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-2)]">
                    <Volume2 size={12} className="text-[var(--accent-orange)]" />
                    Stereo Output
                  </div>
                  Final bus for all insert routes and export level.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
