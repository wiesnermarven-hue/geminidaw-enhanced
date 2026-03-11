import { memo, type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { CopyPlus, Eraser, Layers3 } from 'lucide-react';
import { type PlaylistClip, useDawStore } from '../store';

const PLAYLIST_ROWS = 8;
const PLAYLIST_BARS = 32;
const DEFAULT_CLIP_LENGTH = 4;
const ROW_INDICES = Array.from({ length: PLAYLIST_ROWS }, (_, index) => index);
const BAR_INDICES = Array.from({ length: PLAYLIST_BARS }, (_, index) => index);
const GRID_COLUMNS = { gridTemplateColumns: `repeat(${PLAYLIST_BARS}, minmax(0, 1fr))` };

type DragState = {
  clipId: string;
  mode: 'move' | 'resize';
  startRow: number;
  startBar: number;
  startLength: number;
  pointerOffsetBars: number;
};

type PreviewState = {
  clipId: string;
  row: number;
  start: number;
  length: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const PlaylistBarHeader = memo(() => {
  const currentStep = useDawStore((state) => state.currentStep);
  const playheadBar = Math.floor((currentStep / 16) * PLAYLIST_BARS);

  return (
    <div className="grid gap-[2px]" style={GRID_COLUMNS}>
      {BAR_INDICES.map((bar) => (
        <div
          key={bar}
          className={`rounded-sm py-1 text-center text-[9px] font-bold ${bar === playheadBar ? 'bg-[var(--accent-green)] text-[#1f252a]' : bar % 4 === 0 ? 'bg-[#22272d] text-[var(--text-1)]' : 'text-[var(--text-2)]'}`}
        >
          {bar + 1}
        </div>
      ))}
    </div>
  );
});

type PlaylistGridRowProps = {
  row: number;
  rowClips: PlaylistClip[];
  preview: PreviewState | null;
  previewColor: string | null;
  selectedPatternId: string;
  addPlaylistClip: (patternId: string, row: number, start: number, length?: number) => void;
  addAutomationPoint: (clipId: string, x: number, value: number) => void;
  removePlaylistClip: (clipId: string) => void;
  setAutomationPoint: (clipId: string, pointId: string, x: number, value: number) => void;
  setSelectedPattern: (id: string) => void;
  setDragState: Dispatch<SetStateAction<DragState | null>>;
  setPreview: Dispatch<SetStateAction<PreviewState | null>>;
  patternMap: Map<string, { id: string; name: string; color: string }>;
  sampleMap: Map<string, { id: string; name: string; color: string }>;
};

const PlaylistGridRow = memo(({
  row,
  rowClips,
  preview,
  previewColor,
  selectedPatternId,
  addPlaylistClip,
  addAutomationPoint,
  removePlaylistClip,
  setAutomationPoint,
  setSelectedPattern,
  setDragState,
  setPreview,
  patternMap,
  sampleMap,
}: PlaylistGridRowProps) => (
  <div className="relative h-14 border-b border-[#1e2226]/80 px-2 py-1">
    <div className="grid h-full gap-[2px]" style={GRID_COLUMNS}>
      {BAR_INDICES.map((bar) => (
        <button
          key={`${row}-${bar}`}
          onClick={() => addPlaylistClip(selectedPatternId, row, bar, DEFAULT_CLIP_LENGTH)}
          className={`rounded-[3px] border transition-colors hover:ring-1 hover:ring-[var(--accent-blue)]/50 ${bar % 4 === 0 ? 'border-[#4b535d] bg-[#343a42]' : 'border-[#23282d] bg-[#2b3138] hover:bg-[#353b42]'}`}
        />
      ))}
    </div>

    {rowClips.map((clip) => {
      const pattern = clip.patternId ? patternMap.get(clip.patternId) : null;
      const sample = clip.sampleId ? sampleMap.get(clip.sampleId) : null;
      const clipLabel = clip.clipType === 'pattern'
        ? pattern?.name
        : clip.clipType === 'audio'
          ? sample?.name
          : clip.automationTarget;
      const clipColor = clip.clipType === 'pattern'
        ? pattern?.color
        : clip.clipType === 'audio'
          ? sample?.color
          : '#9ad94f';
      if (!clipLabel || !clipColor) return null;

      return (
        <div
          key={clip.id}
          className="absolute bottom-1 top-1 z-10 rounded-[4px] border shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
          style={{
            left: `calc(${(clip.start / PLAYLIST_BARS) * 100}% + 8px)`,
            width: `calc(${(clip.length / PLAYLIST_BARS) * 100}% - 4px)`,
            backgroundColor: clipColor,
            borderColor: clipColor,
          }}
        >
          <button
            onMouseDown={(event) => {
              event.preventDefault();
              const width = event.currentTarget.getBoundingClientRect().width;
              const offset = clamp(Math.floor(((event.clientX - event.currentTarget.getBoundingClientRect().left) / width) * clip.length), 0, Math.max(0, clip.length - 1));
              setDragState({ clipId: clip.id, mode: 'move', startRow: clip.row, startBar: clip.start, startLength: clip.length, pointerOffsetBars: offset });
              setPreview({ clipId: clip.id, row: clip.row, start: clip.start, length: clip.length });
            }}
            onClick={(event) => {
              event.stopPropagation();
              if (pattern) setSelectedPattern(pattern.id);
            }}
            className="flex h-full w-full items-center justify-between px-2 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-white/90"
          >
            <span className="truncate">{clipLabel}</span>
            <Layers3 size={11} />
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              removePlaylistClip(clip.id);
            }}
            className="absolute right-5 top-1/2 -translate-y-1/2 rounded-sm px-1 text-[10px] font-bold text-white/70 hover:bg-black/20 hover:text-white"
          >
            x
          </button>
          <button
            onMouseDown={(event) => {
              event.stopPropagation();
              event.preventDefault();
              setDragState({ clipId: clip.id, mode: 'resize', startRow: clip.row, startBar: clip.start, startLength: clip.length, pointerOffsetBars: 0 });
              setPreview({ clipId: clip.id, row: clip.row, start: clip.start, length: clip.length });
            }}
            className="absolute right-0 top-0 h-full w-3 cursor-ew-resize rounded-r-[4px] bg-black/20"
          />
          {clip.clipType === 'automation' && (
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              onDoubleClick={(event) => {
                event.stopPropagation();
                const rect = event.currentTarget.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const value = 1 - (event.clientY - rect.top) / rect.height;
                addAutomationPoint(clip.id, x, value);
              }}
            >
              <polyline
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2"
                points={(clip.automationPoints || []).map((point) => `${point.x * 100},${(1 - point.value) * 100}`).join(' ')}
              />
              {(clip.automationPoints || []).map((point) => (
                <circle
                  key={point.id}
                  cx={point.x * 100}
                  cy={(1 - point.value) * 100}
                  r="3"
                  fill="#ffffff"
                  onMouseDown={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    if (!rect) return;
                    const move = (moveEvent: MouseEvent) => {
                      setAutomationPoint(
                        clip.id,
                        point.id,
                        clamp((moveEvent.clientX - rect.left) / rect.width, 0, 1),
                        clamp(1 - (moveEvent.clientY - rect.top) / rect.height, 0, 1),
                      );
                    };
                    const up = () => {
                      window.removeEventListener('mousemove', move);
                      window.removeEventListener('mouseup', up);
                    };
                    window.addEventListener('mousemove', move);
                    window.addEventListener('mouseup', up);
                  }}
                />
              ))}
            </svg>
          )}
        </div>
      );
    })}

    {preview?.row === row && previewColor && (
      <div
        className="pointer-events-none absolute bottom-1 top-1 z-20 rounded-[4px] border border-dashed opacity-65"
        style={{
          left: `calc(${(preview.start / PLAYLIST_BARS) * 100}% + 8px)`,
          width: `calc(${(preview.length / PLAYLIST_BARS) * 100}% - 4px)`,
          backgroundColor: previewColor,
          borderColor: '#ffffff',
        }}
      />
    )}
  </div>
));

export const Playlist = () => {
  const {
    transportMode,
    songSections,
    patterns,
    selectedPatternId,
    selectedSampleId,
    sampleLibrary,
    setSelectedPattern,
    setPatternName,
    setPatternColor,
    setSongSectionName,
    moveSongSection,
    resizeSongSection,
    playlistClips,
    addPlaylistClip,
    addAudioClip,
    addAutomationClip,
    addAutomationPoint,
    removePlaylistClip,
    movePlaylistClip,
    resizePlaylistClip,
    setAutomationPoint,
    clearPlaylist,
  } = useDawStore(useShallow((state) => ({
    transportMode: state.transportMode,
    songSections: state.songSections,
    patterns: state.patterns,
    selectedPatternId: state.selectedPatternId,
    selectedSampleId: state.selectedSampleId,
    sampleLibrary: state.sampleLibrary,
    setSelectedPattern: state.setSelectedPattern,
    setPatternName: state.setPatternName,
    setPatternColor: state.setPatternColor,
    setSongSectionName: state.setSongSectionName,
    moveSongSection: state.moveSongSection,
    resizeSongSection: state.resizeSongSection,
    playlistClips: state.playlistClips,
    addPlaylistClip: state.addPlaylistClip,
    addAudioClip: state.addAudioClip,
    addAutomationClip: state.addAutomationClip,
    addAutomationPoint: state.addAutomationPoint,
    removePlaylistClip: state.removePlaylistClip,
    movePlaylistClip: state.movePlaylistClip,
    resizePlaylistClip: state.resizePlaylistClip,
    setAutomationPoint: state.setAutomationPoint,
    clearPlaylist: state.clearPlaylist,
  })));

  const gridRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const patternMap = useMemo(() => new Map(patterns.map((pattern) => [pattern.id, pattern])), [patterns]);
  const sampleMap = useMemo(() => new Map(sampleLibrary.map((sample) => [sample.id, sample])), [sampleLibrary]);
  const selectedPattern = useMemo(() => patterns.find((pattern) => pattern.id === selectedPatternId) || patterns[0], [patterns, selectedPatternId]);
  const clipsByRow = useMemo(() => {
    const rows = new Map<number, PlaylistClip[]>();
    playlistClips.forEach((clip) => {
      const rowClips = rows.get(clip.row);
      if (rowClips) {
        rowClips.push(clip);
      } else {
        rows.set(clip.row, [clip]);
      }
    });
    return rows;
  }, [playlistClips]);
  const previewClip = useMemo(() => playlistClips.find((clip) => clip.id === preview?.clipId) || null, [playlistClips, preview?.clipId]);
  const previewColor = useMemo(() => {
    if (!previewClip || !selectedPattern) return null;
    if (previewClip.clipType === 'audio' && previewClip.sampleId) return sampleMap.get(previewClip.sampleId)?.color || '#7ab8ff';
    if (previewClip.clipType === 'automation') return '#9ad94f';
    return patternMap.get(previewClip.patternId || selectedPattern.id)?.color || selectedPattern.color;
  }, [patternMap, previewClip, sampleMap, selectedPattern]);

  useEffect(() => {
    if (!dragState) {
      return;
    }

    const getGridCell = (clientX: number, clientY: number) => {
      const rect = gridRef.current?.getBoundingClientRect();
      if (!rect) {
        return null;
      }

      const relativeX = clamp(clientX - rect.left, 0, rect.width - 1);
      const relativeY = clamp(clientY - rect.top - 36, 0, rect.height - 37);
      const bar = clamp(Math.floor((relativeX / rect.width) * PLAYLIST_BARS), 0, PLAYLIST_BARS - 1);
      const row = clamp(Math.floor(relativeY / 56), 0, PLAYLIST_ROWS - 1);
      return { row, bar };
    };

    const handleMouseMove = (event: MouseEvent) => {
      const cell = getGridCell(event.clientX, event.clientY);
      if (!cell) {
        return;
      }

      if (dragState.mode === 'move') {
        const start = clamp(cell.bar - dragState.pointerOffsetBars, 0, PLAYLIST_BARS - dragState.startLength);
        setPreview({ clipId: dragState.clipId, row: cell.row, start, length: dragState.startLength });
        return;
      }

      const nextLength = clamp(cell.bar - dragState.startBar + 1, 1, PLAYLIST_BARS - dragState.startBar);
      setPreview({ clipId: dragState.clipId, row: dragState.startRow, start: dragState.startBar, length: nextLength });
    };

    const handleMouseUp = () => {
      if (preview) {
        if (dragState.mode === 'move') {
          movePlaylistClip(preview.clipId, preview.row, preview.start);
        } else {
          resizePlaylistClip(preview.clipId, preview.length);
        }
      }

      setDragState(null);
      setPreview(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, movePlaylistClip, preview, resizePlaylistClip]);

  return (
    <div className="relative flex flex-1 flex-col overflow-auto bg-[radial-gradient(circle_at_top,#2b3038_0%,#20242a_65%)] p-4">
      <div className="mb-3 flex items-center justify-between rounded-sm border border-[var(--line-hard)] bg-[linear-gradient(180deg,#353b43_0%,#272c33_100%)] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-2)]">Playlist</div>
          <div className="text-xs text-[var(--text-1)]">Ghost-preview drag, snap-to-grid movement, automation curves, and {transportMode} playback</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => addPlaylistClip(selectedPatternId, 0, 0, DEFAULT_CLIP_LENGTH)}
            className="flex items-center gap-2 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2c3137_0%,#1f2328_100%)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--text-1)] transition-colors hover:bg-[var(--panel-3)] hover:text-[var(--accent-green)]"
          >
            <CopyPlus size={12} /> Drop Pattern
          </button>
          <button
            onClick={() => addAudioClip(selectedSampleId, 4, 0, DEFAULT_CLIP_LENGTH)}
            className="flex items-center gap-2 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2c3137_0%,#1f2328_100%)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--text-1)] transition-colors hover:bg-[var(--panel-3)] hover:text-[var(--accent-blue)]"
          >
            <CopyPlus size={12} /> Drop Audio
          </button>
          <button
            onClick={() => addAutomationClip('masterVolume', 6, 0, DEFAULT_CLIP_LENGTH)}
            className="flex items-center gap-2 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2c3137_0%,#1f2328_100%)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--text-1)] transition-colors hover:bg-[var(--panel-3)] hover:text-[var(--accent-green)]"
          >
            <CopyPlus size={12} /> Drop Automation
          </button>
          <button
            onClick={clearPlaylist}
            className="flex items-center gap-2 rounded-sm border border-black/40 bg-[linear-gradient(180deg,#2c3137_0%,#1f2328_100%)] px-2 py-1 text-[10px] font-bold uppercase text-[var(--text-1)] transition-colors hover:bg-[var(--panel-3)] hover:text-[var(--accent-red)]"
          >
            <Eraser size={12} /> Clear Playlist
          </button>
        </div>
      </div>

      {selectedPattern && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-sm border border-[var(--line-hard)] bg-[linear-gradient(180deg,#353b43_0%,#272c33_100%)] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          {patterns.map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => setSelectedPattern(pattern.id)}
              className={`rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors ${selectedPatternId === pattern.id ? 'text-[#1f252a]' : 'bg-[#23272d] text-[var(--text-1)] hover:bg-[var(--panel-3)]'}`}
              style={selectedPatternId === pattern.id ? { backgroundColor: pattern.color } : undefined}
            >
              {pattern.name}
            </button>
          ))}
          <input
            value={selectedPattern.name}
            onChange={(event) => setPatternName(selectedPattern.id, event.target.value)}
            className="w-36 rounded-sm border border-black/40 bg-[#1f2429] px-2 py-1 text-xs text-[var(--text-0)] outline-none"
          />
          <input
            type="color"
            value={selectedPattern.color}
            onChange={(event) => setPatternColor(selectedPattern.id, event.target.value)}
            className="h-8 w-8 rounded border border-black/40 bg-transparent"
          />
        </div>
      )}

      <div className="flex flex-1 overflow-auto rounded-sm border border-[var(--line-hard)] bg-[linear-gradient(180deg,#31363d_0%,#262b31_100%)] shadow-[0_16px_36px_rgba(0,0,0,0.32)]">
        <div className="sticky left-0 z-20 w-52 shrink-0 border-r border-[var(--line-hard)] bg-[linear-gradient(180deg,#373d45_0%,#292e35_100%)]">
          <div className="flex h-10 items-center border-b border-[var(--line-hard)] px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-2)]">
            Playlist Tracks
          </div>
          {ROW_INDICES.map((row) => (
            <div key={row} className="flex h-14 items-center justify-between border-b border-[#1e2226] px-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-2)]">Track {row + 1}</div>
                <div className="text-xs text-[var(--text-0)]">Pattern Lane {row + 1}</div>
              </div>
              <div className="text-[10px] text-[var(--text-2)]">{clipsByRow.get(row)?.length || 0} clips</div>
            </div>
          ))}
        </div>

        <div ref={gridRef} className="relative min-w-[1400px] flex-1">
          <div className="sticky top-0 z-10 border-b border-[var(--line-hard)] bg-[linear-gradient(180deg,#3a4149_0%,#2b3138_100%)] px-2 py-1">
            <div className="relative mb-1 h-6">
              {songSections.map((section) => (
                <div
                  key={section.id}
                  className="absolute top-0 rounded-sm px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#1f252a]"
                  style={{
                    left: `calc(${(section.start / PLAYLIST_BARS) * 100}% + ${section.start === 0 ? 0 : 2}px)`,
                    width: `calc(${(section.length / PLAYLIST_BARS) * 100}% - 2px)`,
                    backgroundColor: section.color,
                  }}
                  onDoubleClick={() => {
                    const nextName = window.prompt('Section name', section.name);
                    if (nextName) setSongSectionName(section.id, nextName);
                  }}
                >
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      moveSongSection(section.id, section.start + 1);
                    }}
                    className="mr-1 rounded px-1 bg-black/15"
                    title="Move right"
                  >
                    +
                  </button>
                  {section.name}
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      resizeSongSection(section.id, section.length + 1);
                    }}
                    className="ml-1 rounded px-1 bg-black/15"
                    title="Extend"
                  >
                    {'>'}
                  </button>
                </div>
              ))}
            </div>
            <PlaylistBarHeader />
          </div>

          {ROW_INDICES.map((row) => (
            <PlaylistGridRow
              key={row}
              row={row}
              rowClips={(clipsByRow.get(row) || []).filter((clip) => clip.id !== preview?.clipId)}
              preview={preview}
              previewColor={previewColor}
              selectedPatternId={selectedPatternId}
              addPlaylistClip={addPlaylistClip}
              addAutomationPoint={addAutomationPoint}
              removePlaylistClip={removePlaylistClip}
              setAutomationPoint={setAutomationPoint}
              setSelectedPattern={setSelectedPattern}
              setDragState={setDragState}
              setPreview={setPreview}
              patternMap={patternMap}
              sampleMap={sampleMap}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
