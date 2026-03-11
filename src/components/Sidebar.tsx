import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { Folder, Music, ChevronRight, Plus, Search, Library, Drum, AudioWaveform, Disc3, Sparkles, Tags, Save } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { defaultPresets, presetPacks, presetTags, starterTemplates, useDawStore, drumSynths, melodicSynths } from '../store';

export const Sidebar = () => {
  const { addChannel, channels, selectedChannelId, presetFavorites, setChannelPreset, generateSongArrangement, loadStarterTemplate, loadPresetPack, exportPresetBank, importPresetBank, sampleLibrary, selectedSampleId, setSelectedSample, addAudioClip, addAutomationClip, setView } = useDawStore(useShallow((state) => ({
    addChannel: state.addChannel,
    channels: state.channels,
    selectedChannelId: state.selectedChannelId,
    presetFavorites: state.presetFavorites,
    setChannelPreset: state.setChannelPreset,
    generateSongArrangement: state.generateSongArrangement,
    loadStarterTemplate: state.loadStarterTemplate,
    loadPresetPack: state.loadPresetPack,
    exportPresetBank: state.exportPresetBank,
    importPresetBank: state.importPresetBank,
    sampleLibrary: state.sampleLibrary,
    selectedSampleId: state.selectedSampleId,
    setSelectedSample: state.setSelectedSample,
    addAudioClip: state.addAudioClip,
    addAutomationClip: state.addAutomationClip,
    setView: state.setView,
  })));
  const [query, setQuery] = useState('');
  const [drumsOpen, setDrumsOpen] = useState(true);
  const [synthsOpen, setSynthsOpen] = useState(true);
  const [samplesOpen, setSamplesOpen] = useState(true);
  const [automationOpen, setAutomationOpen] = useState(true);
  const [ideasOpen, setIdeasOpen] = useState(true);
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [presetExplorerOpen, setPresetExplorerOpen] = useState(true);
  const [packsOpen, setPacksOpen] = useState(true);
  const [tagFilter, setTagFilter] = useState('all');
  const bankInputRef = useRef<HTMLInputElement>(null);

  const sampleResults = useMemo(
    () => sampleLibrary.filter((sample) => sample.name.toLowerCase().includes(query.toLowerCase())),
    [query, sampleLibrary],
  );
  const selectedChannel = useMemo(() => channels.find((channel) => channel.id === selectedChannelId) || channels[0], [channels, selectedChannelId]);
  const favoritePresets = useMemo(() => presetFavorites.map((entry) => {
    const [synthType, presetName] = entry.split('::');
    return { synthType, presetName };
  }).filter((entry) => entry.synthType && entry.presetName), [presetFavorites]);
  const availableTags = useMemo(() => Array.from(new Set(Object.values(presetTags).flat())).sort(), []);
  const filteredFavoritePresets = useMemo(() => favoritePresets.filter((favorite) => {
    if (tagFilter === 'all') return true;
    return (presetTags[`${favorite.synthType}::${favorite.presetName}`] || []).includes(tagFilter);
  }), [favoritePresets, tagFilter]);
  const presetExplorer = useMemo(() => {
    if (!selectedChannel) return [];
    return Object.keys(defaultPresets[selectedChannel.synthType])
      .map((presetName) => ({
        presetName,
        tags: presetTags[`${selectedChannel.synthType}::${presetName}`] || [],
      }))
      .filter((preset) => {
        const matchesQuery = `${preset.presetName} ${preset.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase());
        const matchesTag = tagFilter === 'all' || preset.tags.includes(tagFilter);
        return matchesQuery && matchesTag;
      });
  }, [query, selectedChannel, tagFilter]);

  const handlePresetBankExport = () => {
    const bank = exportPresetBank();
    const blob = new Blob([JSON.stringify(bank, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'geminidaw-presets.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePresetBankImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      importPresetBank(JSON.parse(await file.text()));
    } catch (error) {
      console.error('Failed to import preset bank', error);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="z-0 flex w-72 flex-col border-r border-[var(--line-hard)] bg-[linear-gradient(180deg,#31363d_0%,#24292e_100%)] shadow-[inset_-1px_0_0_rgba(255,255,255,0.03)]">
      <div className="border-b border-[var(--line-hard)] bg-[linear-gradient(180deg,#363c44_0%,#2a2f35_100%)] p-2">
        <div className="mb-2 flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-2)]">
          <Library size={12} className="text-[var(--accent-orange)]" />
          Browser
        </div>
        <div className="flex items-center gap-2 rounded-sm border border-black/40 bg-[#1d2126] px-2 py-1 text-xs text-[var(--text-1)] shadow-inner">
          <Search size={12} className="text-[var(--text-2)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search instruments / samples"
            className="w-full bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="border-b border-[var(--line-hard)] bg-[#252a30] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-2)]">
        Current project assets
      </div>
      <input ref={bankInputRef} type="file" accept="application/json" className="hidden" onChange={handlePresetBankImport} />

      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        <div onClick={() => setDrumsOpen(!drumsOpen)} className="flex cursor-pointer items-center gap-2 rounded-sm border border-black/30 bg-[linear-gradient(180deg,#4b535d_0%,#3a4048_100%)] p-1.5 text-xs font-semibold text-[var(--text-0)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
          <ChevronRight size={14} className={`text-[var(--text-1)] transition-transform ${drumsOpen ? 'rotate-90' : ''}`} />
          <Drum size={13} className="text-[var(--accent-orange)]" />
          <span>Drums</span>
        </div>
        {drumsOpen && (
          <div className="space-y-1 pl-5">
            {drumSynths.filter((item) => item.toLowerCase().includes(query.toLowerCase())).map((drum) => (
              <div key={drum} onClick={() => addChannel(drum)} className="group flex cursor-pointer items-center justify-between rounded-sm border border-transparent bg-[#2a2f35] p-1.5 text-xs text-[var(--text-1)] transition-all hover:border-[#4e5862] hover:bg-[#3a4048] hover:text-[var(--text-0)]">
                <div className="flex items-center gap-1.5"><Music size={12} className="text-[var(--text-2)]" /><span>{drum}</span></div>
                <Plus size={12} className="text-[var(--accent-green)] opacity-0 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        )}

        <div onClick={() => setSynthsOpen(!synthsOpen)} className="mt-2 flex cursor-pointer items-center gap-2 rounded-sm border border-black/30 bg-[linear-gradient(180deg,#4b535d_0%,#3a4048_100%)] p-1.5 text-xs font-semibold text-[var(--text-0)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
          <ChevronRight size={14} className={`text-[var(--text-1)] transition-transform ${synthsOpen ? 'rotate-90' : ''}`} />
          <AudioWaveform size={13} className="text-[var(--accent-orange)]" />
          <span>Synths</span>
        </div>
        {synthsOpen && (
          <div className="space-y-1 pl-5">
            {melodicSynths.filter((item) => item.toLowerCase().includes(query.toLowerCase())).map((synth) => (
              <div key={synth} onClick={() => addChannel(synth)} className="group flex cursor-pointer items-center justify-between rounded-sm border border-transparent bg-[#2a2f35] p-1.5 text-xs text-[var(--text-1)] transition-all hover:border-[#4e5862] hover:bg-[#3a4048] hover:text-[var(--text-0)]">
                <div className="flex items-center gap-1.5"><Music size={12} className="text-[var(--text-2)]" /><span>{synth}</span></div>
                <Plus size={12} className="text-[var(--accent-green)] opacity-0 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        )}

        <div onClick={() => setFavoritesOpen(!favoritesOpen)} className="mt-2 flex cursor-pointer items-center gap-2 rounded-sm border border-black/30 bg-[linear-gradient(180deg,#4b535d_0%,#3a4048_100%)] p-1.5 text-xs font-semibold text-[var(--text-0)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
          <ChevronRight size={14} className={`text-[var(--text-1)] transition-transform ${favoritesOpen ? 'rotate-90' : ''}`} />
          <Sparkles size={13} className="text-[var(--accent-orange)]" />
          <span>Favorite Presets</span>
        </div>
        {favoritesOpen && (
          <div className="space-y-1 pl-5">
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 rounded-sm bg-[#2a2f35] px-1.5 py-1 text-[10px] uppercase text-[var(--text-2)]"><Tags size={10} /> Tags</div>
              <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)} className="rounded-sm bg-[#2a2f35] px-1.5 py-1 text-[10px] uppercase text-[var(--text-1)] outline-none">
                <option value="all">all</option>
                {availableTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
              </select>
              <button onClick={handlePresetBankExport} className="rounded-sm bg-[#2a2f35] p-1 text-[var(--accent-green)] hover:bg-[#3a4048]" title="Export preset bank"><Save size={10} /></button>
              <button onClick={() => bankInputRef.current?.click()} className="rounded-sm bg-[#2a2f35] px-1.5 py-1 text-[10px] uppercase text-[var(--accent-blue)] hover:bg-[#3a4048]">Import</button>
            </div>
            {filteredFavoritePresets.length === 0 && (
              <div className="rounded-sm bg-[#2a2f35] p-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--text-2)]">Star presets in the rack to pin them here</div>
            )}
            {filteredFavoritePresets.map((favorite) => {
              const canApply = selectedChannel && selectedChannel.synthType === favorite.synthType && defaultPresets[selectedChannel.synthType][favorite.presetName];
              const tags = presetTags[`${favorite.synthType}::${favorite.presetName}`] || [];
              return (
                <button
                  key={`${favorite.synthType}-${favorite.presetName}`}
                  onClick={() => canApply && setChannelPreset(selectedChannel.id, favorite.presetName)}
                  className="w-full rounded-sm border border-transparent bg-[#2a2f35] p-1.5 text-left text-xs text-[var(--text-1)] transition-all hover:border-[#4e5862] hover:bg-[#3a4048] hover:text-[var(--text-0)] disabled:opacity-50"
                  disabled={!canApply}
                >
                  <div className="font-semibold text-[var(--text-0)]">{favorite.presetName}</div>
                  <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-2)]">{favorite.synthType}{canApply ? ' / apply to selected' : ' / select matching channel'}</div>
                  {tags.length > 0 && <div className="mt-1 text-[9px] uppercase tracking-[0.1em] text-[var(--accent-blue)]">{tags.join(' / ')}</div>}
                </button>
              );
            })}
          </div>
        )}

        <div onClick={() => setPresetExplorerOpen(!presetExplorerOpen)} className="mt-2 flex cursor-pointer items-center gap-2 rounded-sm border border-black/30 bg-[linear-gradient(180deg,#4b535d_0%,#3a4048_100%)] p-1.5 text-xs font-semibold text-[var(--text-0)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
          <ChevronRight size={14} className={`text-[var(--text-1)] transition-transform ${presetExplorerOpen ? 'rotate-90' : ''}`} />
          <AudioWaveform size={13} className="text-[var(--accent-blue)]" />
          <span>Preset Explorer</span>
        </div>
        {presetExplorerOpen && selectedChannel && (
          <div className="space-y-1 pl-5">
            <div className="rounded-sm bg-[#2a2f35] p-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--text-2)]">{selectedChannel.name} / {selectedChannel.synthType}</div>
            {presetExplorer.map((preset) => (
              <button
                key={preset.presetName}
                onClick={() => setChannelPreset(selectedChannel.id, preset.presetName)}
                className="w-full rounded-sm border border-transparent bg-[#2a2f35] p-1.5 text-left text-xs text-[var(--text-1)] transition-all hover:border-[#4e5862] hover:bg-[#3a4048] hover:text-[var(--text-0)]"
              >
                <div className="font-semibold text-[var(--text-0)]">{preset.presetName}</div>
                {preset.tags.length > 0 && <div className="text-[9px] uppercase tracking-[0.1em] text-[var(--accent-blue)]">{preset.tags.join(' / ')}</div>}
              </button>
            ))}
          </div>
        )}

        <div onClick={() => setPacksOpen(!packsOpen)} className="mt-2 flex cursor-pointer items-center gap-2 rounded-sm border border-black/30 bg-[linear-gradient(180deg,#4b535d_0%,#3a4048_100%)] p-1.5 text-xs font-semibold text-[var(--text-0)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
          <ChevronRight size={14} className={`text-[var(--text-1)] transition-transform ${packsOpen ? 'rotate-90' : ''}`} />
          <Tags size={13} className="text-[var(--accent-green)]" />
          <span>Preset Packs</span>
        </div>
        {packsOpen && (
          <div className="space-y-1 pl-5">
            {presetPacks.map((pack) => (
              <button
                key={pack.name}
                onClick={() => loadPresetPack(pack.name)}
                className="w-full rounded-sm border border-transparent bg-[#2a2f35] p-1.5 text-left text-xs text-[var(--text-1)] transition-all hover:border-[#4e5862] hover:bg-[#3a4048] hover:text-[var(--text-0)]"
              >
                <div className="font-semibold text-[var(--text-0)]">{pack.name}</div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-2)]">{pack.favorites.length} curated presets</div>
              </button>
            ))}
          </div>
        )}

        <div onClick={() => setIdeasOpen(!ideasOpen)} className="mt-2 flex cursor-pointer items-center gap-2 rounded-sm border border-black/30 bg-[linear-gradient(180deg,#4b535d_0%,#3a4048_100%)] p-1.5 text-xs font-semibold text-[var(--text-0)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
          <ChevronRight size={14} className={`text-[var(--text-1)] transition-transform ${ideasOpen ? 'rotate-90' : ''}`} />
          <Sparkles size={13} className="text-[var(--accent-green)]" />
          <span>Easy Music</span>
        </div>
        {ideasOpen && (
          <div className="space-y-1 pl-5">
            {starterTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  loadStarterTemplate(template.id);
                  setView('rack');
                }}
                className="w-full rounded-sm border border-transparent bg-[#2a2f35] p-1.5 text-left text-xs text-[var(--text-1)] transition-all hover:border-[#4e5862] hover:bg-[#3a4048] hover:text-[var(--text-0)]"
              >
                <div className="font-semibold text-[var(--text-0)]">{template.name}</div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-2)]">{template.description}</div>
              </button>
            ))}
            <button
              onClick={() => generateSongArrangement()}
              className="w-full rounded-sm border border-[#36516f] bg-[linear-gradient(180deg,#32414f_0%,#23303c_100%)] p-1.5 text-left text-xs text-[var(--text-1)] transition-all hover:border-[#5e89b0] hover:text-[var(--text-0)]"
            >
              <div className="font-semibold text-[var(--accent-blue)]">Auto Arrange</div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-2)]">Builds a quick song layout from current patterns</div>
            </button>
          </div>
        )}

        <div onClick={() => setSamplesOpen(!samplesOpen)} className="mt-2 flex cursor-pointer items-center gap-2 rounded-sm border border-black/30 bg-[linear-gradient(180deg,#4b535d_0%,#3a4048_100%)] p-1.5 text-xs font-semibold text-[var(--text-0)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
          <ChevronRight size={14} className={`text-[var(--text-1)] transition-transform ${samplesOpen ? 'rotate-90' : ''}`} />
          <Disc3 size={13} className="text-[var(--accent-blue)]" />
          <span>Samples</span>
        </div>
        {samplesOpen && (
          <div className="space-y-1 pl-5">
            {sampleResults.map((sample) => (
              <div key={sample.id} className={`group rounded-sm border p-1.5 text-xs transition-all ${selectedSampleId === sample.id ? 'border-white/30 bg-[#3a4048] text-[var(--text-0)]' : 'border-transparent bg-[#2a2f35] text-[var(--text-1)] hover:border-[#4e5862] hover:bg-[#3a4048] hover:text-[var(--text-0)]'}`}>
                <div className="mb-1 flex items-center justify-between">
                  <button onClick={() => setSelectedSample(sample.id)} className="flex flex-1 items-center gap-1.5 text-left">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: sample.color }} />
                    <span>{sample.name}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSample(sample.id);
                      addAudioClip(sample.id, 4, 0, 4);
                      setView('playlist');
                    }}
                    className="rounded-sm px-1 py-0.5 text-[10px] font-bold uppercase text-[var(--accent-green)] hover:bg-black/20"
                  >
                    Drop
                  </button>
                </div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-2)]">{sample.kind}</div>
              </div>
            ))}
          </div>
        )}

        <div onClick={() => setAutomationOpen(!automationOpen)} className="mt-2 flex cursor-pointer items-center gap-2 rounded-sm border border-black/30 bg-[linear-gradient(180deg,#4b535d_0%,#3a4048_100%)] p-1.5 text-xs font-semibold text-[var(--text-0)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
          <ChevronRight size={14} className={`text-[var(--text-1)] transition-transform ${automationOpen ? 'rotate-90' : ''}`} />
          <Sparkles size={13} className="text-[var(--accent-green)]" />
          <span>Automation</span>
        </div>
        {automationOpen && (
          <div className="space-y-1 pl-5">
            {['masterVolume', 'bpm', 'filterSweep'].filter((item) => item.toLowerCase().includes(query.toLowerCase())).map((target) => (
              <button
                key={target}
                onClick={() => {
                  addAutomationClip(target, 6, 0, 4);
                  setView('playlist');
                }}
                className="flex w-full items-center justify-between rounded-sm border border-transparent bg-[#2a2f35] p-1.5 text-xs text-[var(--text-1)] transition-all hover:border-[#4e5862] hover:bg-[#3a4048] hover:text-[var(--text-0)]"
              >
                <span>{target}</span>
                <Plus size={12} className="text-[var(--accent-green)]" />
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#23272d_0%,#1d2126_100%)] p-2 text-[11px] text-[var(--text-1)] shadow-inner">
          <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-2)]">
            <Folder size={11} className="text-[var(--accent-orange)]" />
            Browser tip
          </div>
          Search, pick a sample, then drop audio or automation clips straight into the playlist. This is the first step toward a fuller FL-style browser workflow.
        </div>
      </div>
    </div>
  );
};
