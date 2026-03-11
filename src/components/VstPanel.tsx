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

  return (
    <div className="bg-[#2a2f35] border border-[var(--line-hard)] rounded-sm p-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[var(--text-0)]">{pluginName}</span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[10px] text-[var(--text-1)] hover:text-[var(--accent-green)]"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      {isExpanded && (
        <div className="space-y-1">
          {parameters.map((param) => (
            <div key={param.id} className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] text-[var(--text-2)]">
                <span>{param.name}</span>
                <span>{Math.round(param.value * 100)}%</span>
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