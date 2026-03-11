import { Suspense, lazy, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { useDawStore } from './store';
import { initAudio } from './audio/engine';

const ChannelRack = lazy(() => import('./components/ChannelRack').then((module) => ({ default: module.ChannelRack })));
const PianoRoll = lazy(() => import('./components/PianoRoll').then((module) => ({ default: module.PianoRoll })));
const Playlist = lazy(() => import('./components/Playlist').then((module) => ({ default: module.Playlist })));
const Mixer = lazy(() => import('./components/Mixer').then((module) => ({ default: module.Mixer })));

export default function App() {
  const { activeView, togglePlay, saveProject, loadProject } = useDawStore(useShallow((state) => ({
    activeView: state.activeView,
    togglePlay: state.togglePlay,
    saveProject: state.saveProject,
    loadProject: state.loadProject,
  })));

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable = target?.tagName === 'INPUT' || target?.tagName === 'SELECT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveProject();
        return;
      }

      if (event.code === 'Space' && !isEditable) {
        event.preventDefault();
        await initAudio();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveProject, togglePlay]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--app-bg)] text-[var(--text-0)]">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col border border-[var(--line-hard)] bg-[linear-gradient(180deg,#2f343a_0%,#23272c_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="flex h-7 items-center justify-between border-b border-black/50 bg-[linear-gradient(180deg,#4b535c_0%,#31363d_52%,#25292e_100%)] px-3 text-[11px] uppercase tracking-[0.18em] text-[var(--text-1)]">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent-orange)] shadow-[0_0_8px_rgba(255,156,47,0.8)]" />
            <span>geminiDAW Producer Edition</span>
          </div>
          <div className="hidden md:block text-[var(--text-2)]">FL-style workflow mockup</div>
        </div>
        <TopBar />
        <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <Suspense fallback={<div className="flex flex-1 items-center justify-center text-sm text-[var(--text-1)]">Loading view...</div>}>
          {activeView === 'rack' && <ChannelRack />}
          {activeView === 'pianoRoll' && <PianoRoll />}
          {activeView === 'playlist' && <Playlist />}
          {activeView === 'mixer' && <Mixer />}
        </Suspense>
        </div>
      </div>
    </div>
  );
}
