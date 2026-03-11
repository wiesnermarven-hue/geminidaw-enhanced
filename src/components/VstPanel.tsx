import React, { useState } from 'react';

interface VstParameter {
  id: string;
  name: string;
  min: number;
  max: number;
  value: number;
  type: 'knob' | 'slider' | 'toggle';
}

interface VstPanelProps {
  pluginName: string;
  parameters: VstParameter[];
  onParameterChange: (id: string, value: number) => void;
}

export const VstPanel: React.FC<VstPanelProps> = ({
  pluginName,
  parameters,
  onParameterChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [mode, setMode] = useState<'normal' | 'liveDrum' | 'aiSynth'>('normal');

  const generateAISynth = () => {
    // AI-inspired synth generation based on lacunary harmonics and PolyBLEP
    const newParams = [
      { id: 'osc1_type', name: 'Osc1 Type', min: 0, max: 3, value: Math.floor(Math.random() * 4), type: 'knob' },
      { id: 'lacunarity', name: 'Lacunarity Level', min: 0, max: 1, value: Math.random(), type: 'slider' },
      { id: 'fractal_depth', name: 'Fractal Depth', min: 1, max: 10, value: Math.floor(Math.random() * 10) + 1, type: 'knob' },
      { id: 'cutoff', name: 'Cutoff', min: 0, max: 1, value: 0.5 + Math.random() * 0.5, type: 'slider' },
      { id: 'resonance', name: 'Resonance', min: 0, max: 1, value: Math.random() * 0.5, type: 'slider' },
      { id: 'attack', name: 'Attack', min: 0, max: 1, value: Math.random() * 0.2, type: 'knob' },
      { id: 'decay', name: 'Decay', min: 0, max: 1, value: 0.2 + Math.random() * 0.5, type: 'knob' },
      { id: 'sustain', name: 'Sustain', min: 0, max: 1, value: 0.3 + Math.random() * 0.7, type: 'slider' },
      { id: 'release', name: 'Release', min: 0, max: 1, value: 0.3 + Math.random() * 0.7, type: 'slider' },
      { id: 'enabled', name: 'Enabled', min: 0, max: 1, value: 1, type: 'toggle' },
    ];
    return newParams;
  };

  const liveDrumParams = [
    { id: 'kick_freq', name: 'Kick Freq', min: 50, max: 200, value: 80, type: 'slider' },
    { id: 'snare_decay', name: 'Snare Decay', min: 0.1, max: 2, value: 0.5, type: 'slider' },
    { id: 'hat_pitch', name: 'Hat Pitch', min: 1000, max: 8000, value: 4000, type: 'slider' },
    { id: 'perc_tune', name: 'Perc Tune', min: 0.5, max: 2, value: 1, type: 'knob' },
    { id: 'velocity_sens', name: 'Velocity Sens', min: 0, max: 1, value: 0.8, type: 'slider' },
  ];

  const currentParams = mode === 'aiSynth' ? generateAISynth() : mode === 'liveDrum' ? liveDrumParams : parameters;

  return (
    <div className="bg-[#2a2f35] border border-[var(--line-hard)] rounded-sm p-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[var(--text-0)]">{pluginName} ({mode})</span>
        <div className="flex gap-1">
          <button
            onClick={() => setMode('normal')}
            className={`text-[10px] px-1 rounded ${mode === 'normal' ? 'bg-[var(--accent-blue)]' : 'text-[var(--text-1)]'}`}
          >
            Normal
          </button>
          <button
            onClick={() => setMode('liveDrum')}
            className={`text-[10px] px-1 rounded ${mode === 'liveDrum' ? 'bg-[var(--accent-orange)]' : 'text-[var(--text-1)]'}`}
          >
            Live Drum
          </button>
          <button
            onClick={() => setMode('aiSynth')}
            className={`text-[10px] px-1 rounded ${mode === 'aiSynth' ? 'bg-[var(--accent-green)]' : 'text-[var(--text-1)]'}`}
          >
            AI Synth
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] text-[var(--text-1)] hover:text-[var(--accent-green)]"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="space-y-1">
          {mode === 'aiSynth' && (
            <button
              onClick={() => {
                const newParams = generateAISynth();
                // Apply new params (placeholder)
                console.log('Generated AI Synth:', newParams);
              }}
              className="w-full rounded-sm bg-[var(--accent-purple)] p-1 text-xs text-[#1f252a]"
            >
              Generate New AI Synth
            </button>
          )}
          {currentParams.map((param) => (
            <div key={param.id} className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] text-[var(--text-2)]">
                <span>{param.name}</span>
                <span>{param.type === 'knob' || param.type === 'slider' ? Math.round(param.value * 100) + '%' : param.value > 0 ? 'ON' : 'OFF'}</span>
              </div>
              {param.type === 'knob' && (
                <div className="flex items-center justify-center">
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step="0.01"
                    value={param.value}
                    onChange={(e) => onParameterChange(param.id, parseFloat(e.target.value))}
                    className="w-20 accent-[var(--accent-orange)]"
                  />
                </div>
              )}
              {param.type === 'slider' && (
                <div className="flex items-center">
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step="0.01"
                    value={param.value}
                    onChange={(e) => onParameterChange(param.id, parseFloat(e.target.value))}
                    className="w-full accent-[var(--accent-orange)]"
                  />
                </div>
              )}
              {param.type === 'toggle' && (
                <button
                  onClick={() => onParameterChange(param.id, param.value === 0 ? 1 : 0)}
                  className={`w-full py-1 text-[10px] rounded-sm transition-colors ${
                    param.value > 0 ? 'bg-[var(--accent-green)] text-[#1f252a]' : 'bg-[var(--panel-3)] text-[var(--text-1)]'
                  }`}
                >
                  {param.value > 0 ? 'ON' : 'OFF'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};