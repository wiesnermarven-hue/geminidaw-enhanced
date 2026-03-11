import { ChangeEvent, useMemo, useRef } from 'react';
import { Play, Square, Trash2, Circle, Clock, Volume2, Save, FolderOpen, Cpu, SlidersHorizontal, Music2, Disc3, Columns3, SlidersVertical, CopyPlus, PlusSquare } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { PATTERN_LENGTH_OPTIONS, useDawStore } from '../store';
import { initAudio } from '../audio/engine';

export const TopBar = () => {
  const { isPlaying, togglePlay, stop, bpm, setBpm, clearSteps, activeView, setView, transportMode, setTransportMode, generateSongArrangement, masterVolume, setMasterVolume, saveProject, loadProject, midiInputs, selectedMidiInput, setSelectedMidiInput, midiError, projectStatus, lastSavedAt, channels, patterns, selectedPatternId, setSelectedPattern, addPattern, duplicatePattern, setPatternName, setPatternColor, patternLength, setPatternLength, getProjectData, importProjectData } = useDawStore(useShallow((state) => ({
    isPlaying: state.isPlaying,
    togglePlay: state.togglePlay,
    stop: state.stop,
    bpm: state.bpm,
    setBpm: state.setBpm,
    clearSteps: state.clearSteps,
    activeView: state.activeView,
    setView: state.setView,
    transportMode: state.transportMode,
    setTransportMode: state.setTransportMode,
    generateSongArrangement: state.generateSongArrangement,
    masterVolume: state.masterVolume,
    setMasterVolume: state.setMasterVolume,
    saveProject: state.saveProject,
    loadProject: state.loadProject,
    midiInputs: state.midiInputs,
    selectedMidiInput: state.selectedMidiInput,
    setSelectedMidiInput: state.setSelectedMidiInput,
    midiError: state.midiError,
    projectStatus: state.projectStatus,
    lastSavedAt: state.lastSavedAt,
    channels: state.channels,
    patterns: state.patterns,
    selectedPatternId: state.selectedPatternId,
    setSelectedPattern: state.setSelectedPattern,
    addPattern: state.addPattern,
    duplicatePattern: state.duplicatePattern,
    setPatternName: state.setPatternName,
    setPatternColor: state.setPatternColor,
    patternLength: state.patternLength,
    setPatternLength: state.setPatternLength,
    getProjectData: state.getProjectData,
    importProjectData: state.importProjectData,
  })));
  const savedLabel = lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalNotes = useMemo(() => channels.reduce((sum, channel) => sum + channel.notes.length, 0), [channels]);
  const selectedPattern = useMemo(() => patterns.find((pattern) => pattern.id === selectedPatternId) || patterns[0], [patterns, selectedPatternId]);

  const handlePlay = async () => {
    await initAudio();
    togglePlay();
  };

  const handleExport = () => {
    const projectData = getProjectData();
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');

    link.href = url;
    link.download = `geminidaw-${stamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      importProjectData(JSON.parse(text));
    } catch (error) {
      console.error('Failed to import project', error);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="z-10 border-b border-[var(--line-hard)] bg-[linear-gradient(180deg,#3b4148_0%,#2c3137_54%,#262b30_100%)] px-2 py-1 text-[var(--text-1)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.2)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-black/30 bg-[radial-gradient(circle_at_35%_35%,#ffbb63_0%,#ff992d_40%,#cb5b15_100%)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.35),0_0_16px_rgba(255,153,45,0.25)]">
            <Disc3 size={14} className="text-[#2c3137]" />
          </div>
          <div className="leading-none">
            <div className="text-sm font-bold tracking-tight text-[var(--text-0)]">geminiDAW</div>
            <div className="text-[9px] font-bold uppercase tracking-[0.26em] text-[var(--text-2)]">step sequencer</div>
          </div>
        </div>

        <div className="flex items-center rounded-sm border border-black/40 bg-[linear-gradient(180deg,#23272d_0%,#1d2126_100%)] p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <button 
            className="rounded-sm p-1.5 text-[var(--text-1)] transition-colors hover:bg-[var(--panel-3)]"
          >
            <Circle size={14} fill="currentColor" className="text-[var(--accent-red)]" />
          </button>
          <button 
            onClick={handlePlay}
            className={`rounded-sm p-1.5 transition-colors hover:bg-[var(--panel-3)] ${isPlaying ? 'text-[var(--accent-green)]' : 'text-[var(--text-1)]'}`}
          >
            <Play size={16} fill={isPlaying ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={stop}
            className="rounded-sm p-1.5 text-[var(--text-1)] transition-colors hover:bg-[var(--panel-3)]"
          >
            <Square size={14} fill="currentColor" />
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2a2f35_0%,#20242a_100%)] px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex items-center rounded-sm border border-black/40 bg-[#1d2126] px-2 py-1 shadow-inner">
            <Clock size={12} className="mr-2 text-[var(--text-2)]" />
            <input 
              type="number" 
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-12 bg-transparent text-right font-mono text-sm font-bold text-[var(--accent-orange)] outline-none"
            />
          </div>
          <div className="flex items-center rounded-sm border border-black/40 bg-[#1d2126] px-3 py-1 font-mono text-sm font-bold text-[var(--accent-green)] shadow-inner">
            1:01:00
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-black/40 bg-[#1d2126] px-2 py-1 shadow-inner">
            <span className="text-[10px] font-bold uppercase text-[var(--text-2)]">Steps</span>
            <select
              value={patternLength}
              onChange={(e) => setPatternLength(Number(e.target.value))}
              className="cursor-pointer bg-transparent text-xs font-bold text-[var(--accent-orange)] outline-none"
            >
              {PATTERN_LENGTH_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-[#32373c] text-[#e6e6e6]">{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center rounded-sm border border-black/40 bg-[linear-gradient(180deg,#23272d_0%,#1d2126_100%)] p-0.5 text-[10px] font-bold uppercase shadow-inner">
          <button
            onClick={() => setTransportMode('pattern')}
            className={`rounded-sm px-3 py-1 transition-colors ${transportMode === 'pattern' ? 'bg-[var(--accent-blue)] text-[#1f252a]' : 'hover:bg-[var(--panel-3)]'}`}
          >
            Pat
          </button>
          <button
            onClick={() => setTransportMode('song')}
            className={`rounded-sm px-3 py-1 transition-colors ${transportMode === 'song' ? 'bg-[var(--accent-green)] text-[#1f252a]' : 'hover:bg-[var(--panel-3)]'}`}
          >
            Song
          </button>
        </div>

        <div className="flex items-center rounded-sm border border-black/40 bg-[linear-gradient(180deg,#23272d_0%,#1d2126_100%)] p-0.5 text-[10px] font-bold uppercase shadow-inner">
          <button 
            onClick={() => setView('rack')}
            className={`rounded-sm px-3 py-1 transition-colors ${activeView === 'rack' ? 'bg-[var(--panel-3)] text-[var(--text-0)] shadow-sm' : 'hover:bg-[var(--panel-3)]'}`}
          >
            Rack
          </button>
          <button 
            onClick={() => setView('pianoRoll')}
            className={`rounded-sm px-3 py-1 transition-colors ${activeView === 'pianoRoll' ? 'bg-[var(--panel-3)] text-[var(--text-0)] shadow-sm' : 'hover:bg-[var(--panel-3)]'}`}
          >
            Piano
          </button>
          <button
            onClick={() => setView('playlist')}
            className={`rounded-sm px-3 py-1 transition-colors ${activeView === 'playlist' ? 'bg-[var(--panel-3)] text-[var(--text-0)] shadow-sm' : 'hover:bg-[var(--panel-3)]'}`}
          >
            Song
          </button>
          <button
            onClick={() => setView('mixer')}
            className={`rounded-sm px-3 py-1 transition-colors ${activeView === 'mixer' ? 'bg-[var(--panel-3)] text-[var(--text-0)] shadow-sm' : 'hover:bg-[var(--panel-3)]'}`}
          >
            Mixer
          </button>
        </div>

        <div className="hidden xl:flex min-w-0 items-center gap-3 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2d3238_0%,#22272c_100%)] px-3 py-1 shadow-inner">
          <SlidersHorizontal size={13} className="text-[var(--accent-blue)]" />
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-2)] whitespace-nowrap">Session</div>
          <div className="max-w-[240px] truncate text-xs text-[var(--text-0)]">{projectStatus}</div>
          <div className="whitespace-nowrap font-mono text-[10px] text-[var(--accent-green)]">Saved {savedLabel}</div>
        </div>

        <div className="hidden 2xl:flex min-w-0 items-center gap-1 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2d3238_0%,#22272c_100%)] p-1 shadow-inner">
          {patterns.map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => setSelectedPattern(pattern.id)}
              className={`rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${selectedPatternId === pattern.id ? 'text-[#1f252a]' : 'text-[var(--text-1)] hover:bg-[var(--panel-3)]'}`}
              style={selectedPatternId === pattern.id ? { backgroundColor: pattern.color } : undefined}
            >
              {pattern.name}
            </button>
          ))}
          <button onClick={addPattern} className="rounded-sm p-1 text-[var(--accent-green)] hover:bg-[var(--panel-3)]" title="Add Pattern">
            <PlusSquare size={14} />
          </button>
          <button onClick={duplicatePattern} className="rounded-sm p-1 text-[var(--accent-blue)] hover:bg-[var(--panel-3)]" title="Duplicate Pattern">
            <CopyPlus size={14} />
          </button>
        </div>

        {selectedPattern && (
          <div className="hidden xl:flex items-center gap-2 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2d3238_0%,#22272c_100%)] px-2 py-1 shadow-inner">
            <input
              type="color"
              value={selectedPattern.color}
              onChange={(event) => setPatternColor(selectedPattern.id, event.target.value)}
              className="h-6 w-6 cursor-pointer rounded border border-black/40 bg-transparent"
              title="Pattern Color"
            />
            <input
              value={selectedPattern.name}
              onChange={(event) => setPatternName(selectedPattern.id, event.target.value)}
              className="w-32 bg-transparent text-xs font-semibold text-[var(--text-0)] outline-none"
              title="Pattern Name"
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleImport}
        />

        <div className="hidden lg:flex items-center gap-2 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2d3238_0%,#22272c_100%)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--text-2)] shadow-inner">
          <span>{channels.length} channels</span>
          <span className="text-[var(--line-soft)]">/</span>
          <span className="text-[var(--text-1)]">{totalNotes} notes</span>
          <span className="text-[var(--line-soft)]">/</span>
          <span className="text-[var(--text-1)]">Space play</span>
        </div>

        <button 
          onClick={saveProject}
          className="flex items-center gap-1.5 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2c3137_0%,#1f2328_100%)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--text-1)] transition-colors hover:bg-[var(--panel-3)] hover:text-[var(--accent-green)]"
          title="Save Project"
        >
          <Save size={12} /> Save
        </button>
        <button 
          onClick={loadProject}
          className="flex items-center gap-1.5 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2c3137_0%,#1f2328_100%)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--text-1)] transition-colors hover:bg-[var(--panel-3)] hover:text-[var(--accent-orange)]"
          title="Load Project"
        >
          <FolderOpen size={12} /> Load
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2c3137_0%,#1f2328_100%)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--text-1)] transition-colors hover:bg-[var(--panel-3)] hover:text-[var(--accent-green)]"
          title="Export Project"
        >
          <Save size={12} /> Export
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2c3137_0%,#1f2328_100%)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--text-1)] transition-colors hover:bg-[var(--panel-3)] hover:text-[var(--accent-orange)]"
          title="Import Project"
        >
          <FolderOpen size={12} /> Import
        </button>

        <div className="mx-1 h-6 w-px bg-[var(--line-hard)]" />

        <button 
          onClick={clearSteps}
          className="flex items-center gap-1.5 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2c3137_0%,#1f2328_100%)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--text-1)] transition-colors hover:bg-[var(--panel-3)] hover:text-[var(--accent-red)]"
        >
          <Trash2 size={12} /> Clear
        </button>
        <button
          onClick={generateSongArrangement}
          className="flex items-center gap-1.5 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2c3137_0%,#1f2328_100%)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--text-1)] transition-colors hover:bg-[var(--panel-3)] hover:text-[var(--accent-blue)]"
          title="Generate arrangement"
        >
          <CopyPlus size={12} /> Arrange
        </button>

        <div className="hidden md:flex items-center gap-2 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2d3238_0%,#22272c_100%)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--text-2)] shadow-inner">
          <Music2 size={12} className="text-[var(--accent-orange)]" />
          <span>{activeView === 'rack' ? 'Channel Rack' : activeView === 'pianoRoll' ? 'Piano Roll' : activeView === 'playlist' ? 'Playlist' : 'Mixer'}</span>
        </div>

        <div className="hidden xl:flex items-center gap-2 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2d3238_0%,#22272c_100%)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--text-2)] shadow-inner">
          <Columns3 size={12} className="text-[var(--accent-blue)]" />
          <span>Song view</span>
          <span className="text-[var(--line-soft)]">/</span>
          <SlidersVertical size={12} className="text-[var(--accent-green)]" />
          <span>Mixer ready</span>
        </div>

        <div className="mx-1 h-6 w-px bg-[var(--line-hard)]" />

        <div className="group/vol flex items-center rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2d3238_0%,#22272c_100%)] px-2 py-1 shadow-inner">
          <Volume2 size={14} className="mr-2 text-[var(--text-2)]" />
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={masterVolume}
            onChange={(e) => setMasterVolume(Number(e.target.value))}
            className="h-1 w-16 bg-transparent accent-[var(--accent-green)] outline-none"
          />
        </div>

        <div className="mx-1 h-6 w-px bg-[var(--line-hard)]" />

        <div className="relative flex items-center rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2d3238_0%,#22272c_100%)] px-2 py-1 shadow-inner group">
          <Cpu size={14} className={`${midiError ? 'text-[var(--accent-red)]' : 'text-[var(--text-2)]'} mr-2`} />
          <select 
            value={selectedMidiInput || ''}
            onChange={(e) => setSelectedMidiInput(e.target.value || null)}
            className="max-w-[100px] cursor-pointer truncate bg-transparent text-[10px] font-bold uppercase text-[var(--text-1)] outline-none"
          >
            <option value="">No MIDI</option>
            {midiInputs.map(input => (
              <option key={input} value={input}>{input}</option>
            ))}
          </select>
          {midiError && (
            <div className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-64 rounded bg-[var(--accent-red)] p-2 text-[10px] text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {midiError}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};
