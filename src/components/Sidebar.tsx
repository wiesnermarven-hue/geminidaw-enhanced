import { ChangeEvent, useMemo, useRef, useState } from 'react';
import React from 'react';
import { Folder, Music, ChevronRight, Plus, Search, Library, Drum, AudioWaveform, Disc3, Sparkles, Tags, Save, Zap } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { defaultPresets, presetPacks, presetTags, starterTemplates, useDawStore, drumSynths, melodicSynths } from '../store';
import { loadVstPlugin } from '../vst';
import { WaveformPreview } from './WaveformPreview';
import { AutomationEditor } from './AutomationEditor';
import { VstPanel } from './VstPanel';

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
  const [vstOpen, setVstOpen] = useState(true);
  const [expandedSampleId, setExpandedSampleId] = useState<string | null>(null);
  const [vstMode, setVstMode] = useState<'browser' | 'editor'>('browser');
  const [selectedVst, setSelectedVst] = useState<{ pluginName: string; parameters: any[] } | null>(null);
  const bankInputRef = useRef<HTMLInputElement>(null);

  const sampleResults = useMemo(() => {
    return sampleLibrary.filter((sample) => {
      const matchesQuery = sample.name.toLowerCase().includes(query.toLowerCase());
      const matchesTag = tagFilter === 'all' || (sample.kind === 'drum' && tagFilter === 'drum') || (sample.kind === 'texture' && tagFilter === 'texture') || (sample.kind === 'fx' && tagFilter === 'fx');
      return matchesQuery && matchesTag;
    });
  }, [query, sampleLibrary, tagFilter]);

  const selectedChannel = useMemo(() => channels.find((channel) => channel.id === selectedChannelId) || channels[0], [channels, selectedChannelId]);

  const favoritePresets = useMemo(() => presetFavorites.map((entry) => {
    const [synthType, presetName] = entry.split('::');
    return { synthType, presetName };
  }).filter((entry) => entry.synthType && entry.presetName), [presetFavorites]);

  const availableTags = useMemo(() => Array.from(new Set(Object.values(presetTags).flat())).sort(), []);

  const filteredFavoritePresets = useMemo(() => favoritePresets.filter((favorite) => {
    if (tagFilter === 'all') return true;
    const tags = presetTags[`${favorite.synthType}::${favorite.presetName}`] || [];
    return tags.includes(tagFilter);
  }), [favoritePresets, tagFilter]);

  const handleBankImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (reader.result) {
          importPresetBank(JSON.parse(reader.result as string));
        }
      } catch (error) {
        console.error('Failed to import preset bank', error);
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              placeholder="Search everything..."
              className="w-full bg-transparent text-xs text-[var(--text-0)] focus:outline-none"
            />
            <Tags size={12} className="text-[var(--text-2)]" />
            <select
              value={tagFilter}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setTagFilter(e.target.value)}
              className="rounded-sm bg-[#3a4048] px-1 text-xs text-[var(--text-1)] focus:outline-none"
            >
              <option value="all">All</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: 'calc(100vh - 170px)' }}>
          <div className="mt-2 p-2 text-xs">
            Samples section placeholder
          </div>

          <div onClick={() => setAutomationOpen(!automationOpen)} className="mt-2 flex cursor-pointer items-center gap-2 rounded-sm border border-black/30 bg-[linear-gradient(180deg,#4b535d_0%,#3a4048_100%)] p-1.5 text-xs font-semibold text-[var(--text-0)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
            <ChevronRight size={14} className={`text-[var(--text-1)] transition-transform ${automationOpen ? 'rotate-90' : ''}`} />
            <Sparkles size={13} className="text-[var(--accent-green)]" />
            <span>Automation</span>
          </div>
          {automationOpen && (
            <div className="space-y-1 pl-5">
              <button
                onClick={() => { addAutomationClip('masterVolume', 6, 0, 4); setView('playlist'); }}
                className="flex w-full items-center justify-between rounded-sm border border-transparent bg-[#2a2f35] p-1.5 text-xs text-[var(--text-1)] transition-all hover:border-[#4e5862] hover:bg-[#3a4048] hover:text-[var(--text-0)]"
              >
                <span>Volume</span>
                <Plus size={12} className="text-[var(--accent-green)]" />
              </button>
              <button
                onClick={() => { addAutomationClip('bpm', 6, 0, 4); setView('playlist'); }}
                className="flex w-full items-center justify-between rounded-sm border border-transparent bg-[#2a2f35] p-1.5 text-xs text-[var(--text-1)] transition-all hover:border-[#4e5862] hover:bg-[#3a4048] hover:text-[var(--text-0)]"
              >
                <span>BPM</span>
                <Plus size={12} className="text-[var(--accent-green)]" />
              </button>
              <button
                onClick={() => { addAutomationClip('filterSweep', 6, 0, 4); setView('playlist'); }}
                className="flex w-full items-center justify-between rounded-sm border border-transparent bg-[#2a2f35] p-1.5 text-xs text-[var(--text-1)] transition-all hover:border-[#4e5862] hover:bg-[#3a4048] hover:text-[var(--text-0)]"
              >
                <span>Filter Sweep</span>
                <Plus size={12} className="text-[var(--accent-green)]" />
              </button>
              <button className="mt-2 rounded-sm bg-[#3a4048] p-1.5 text-xs">
                <AutomationEditor
                  points={[{ x: 0, value: 0 }, { x: 1, value: 1 }]}
                  onChange={(points) => console.log('Automation points:', points)}
                  width={180}
                  height={60}
                />
              </button>
            </div>
          )}

          <div onClick={() => setVstOpen(!vstOpen)} className="mt-2 flex cursor-pointer items-center gap-2 rounded-sm border border-black/30 bg-[linear-gradient(180deg,#4b535d_0%,#3a4048_100%)] p-1.5 text-xs font-semibold text-[var(--text-0)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
            <ChevronRight size={14} className={`text-[var(--text-1)] transition-transform ${vstOpen ? 'rotate-90' : ''}`} />
            <Disc3 size={13} className="text-[var(--accent-purple)]" />
            <span>VST Plugins</span>
          </div>
          {vstOpen && (
            <div className="space-y-1 pl-5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVstMode('browser')}
                  className={`rounded-sm p-1 text-xs ${vstMode === 'browser' ? 'bg-[var(--accent-purple)] text-[#1f252a]' : 'bg-[#2a2f35] text-[var(--text-1)]'}`}
                >
                  Browser
                </button>
                <button
                  onClick={() => setVstMode('editor')}
                  className={`rounded-sm p-1 text-xs ${vstMode === 'editor' ? 'bg-[var(--accent-purple)] text-[#1f252a]' : 'bg-[#2a2f35] text-[var(--text-1)]'}`}
                >
                  Editor
                </button>
              </div>
              {vstMode === 'browser' && (
                <div>
                  <input
                    placeholder="Enter VST URL or name..."
                    className="mb-2 w-full rounded-sm bg-[#2a2f35] p-1 text-xs text-[var(--text-1)] focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const url = e.currentTarget.value.trim();
                        if (url) {
                          loadVstPlugin(url);
                          setSelectedVst({ pluginName: url, parameters: [] });
                          setVstMode('editor');
                        }
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-1">
                    {['Vital', 'Serum', 'Dexed', 'SynthMaster', 'Helm'].map((plugin) => (
                      <button
                        key={plugin}
                        onClick={() => {
                          setSelectedVst({ pluginName: plugin, parameters: [] });
                          setVstMode('editor');
                        }}
                        className="rounded-sm bg-[#3a4048] px-2 py-1 text-xs hover:bg-[#4e5862]"
                      >
                        {plugin}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {vstMode === 'editor' && selectedVst && (
                <div className="mt-2 space-y-2">
                  <VstPanel
                    pluginName={selectedVst.pluginName}
                    parameters={[
                      { id: 'cutoff', name: 'Cutoff', min: 0, max: 1, value: 0.5, type: 'slider' },
                      { id: 'resonance', name: 'Resonance', min: 0, max: 1, value: 0.25, type: 'slider' },
                      { id: 'attack', name: 'Attack', min: 0, max: 1, value: 0.1, type: 'knob' },
                      { id: 'enabled', name: 'Enabled', min: 0, max: 1, value: 1, type: 'toggle' },
                    ]}
                    onParameterChange={(id, value) => console.log(`Parameter ${id} changed to ${value}`)}
                  />
                  <button
                    onClick={() => setVstMode('browser')}
                    className="w-full rounded-sm bg-[#2a2f35] p-1 text-xs text-[var(--text-1)] hover:bg-[#3a4048]"
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI-Inspired Beat Generator */}
        <div className="mt-2 flex cursor-pointer items-center gap-2 rounded-sm border border-black/30 bg-[linear-gradient(180deg,#4b535d_0%,#3a4048_100%)] p-1.5 text-xs font-semibold text-[var(--text-0)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
          <Zap size={13} className="text-[var(--accent-yellow)]" />
          <span>AI Beat Generator</span>
        </div>
        <div className="space-y-1 pl-5">
          <button
            onClick={() => {
              // Generate random beat for drum channels
              const state = useDawStore.getState();
              state.channels.forEach((channel) => {
                if (drumSynths.includes(channel.synthType)) {
                  const randomSteps = Array.from({ length: state.patternLength }, () => Math.random() > 0.7 ? { isActive: true } : { isActive: false });
                  state.updateChannelSteps(channel.id, randomSteps);
                }
              });
              state.setView('rack');
            }}
            className="flex w-full items-center justify-between rounded-sm border border-transparent bg-[#2a2f35] p-1.5 text-xs text-[var(--text-1)] transition-all hover:border-[#4e5862] hover:bg-[#3a4048] hover:text-[var(--text-0)]"
          >
            <span>Generate Random Beat</span>
            <Zap size={12} className="text-[var(--accent-yellow)]" />
          </button>
        </div>

        <div className="border-t border-[var(--line-hard)] bg-[linear-gradient(180deg,#2a2f35_0%,#24292e_100%)] p-2">
          <div className="mt-3 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#23272d_0%,#1d2126_100%)] p-2 text-[11px] text-[var(--text-1)] shadow-inner">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-2)]">
              <Folder size={11} className="text-[var(--accent-orange)]" />
              Browser tip
            </div>
            Search, pick a sample, then drop audio or automation clips straight into the playlist. This is the first step toward a fuller FL-style browser workflow.
          </div>
        </div>
      </div>
    </>
  );
};