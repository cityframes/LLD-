import React from 'react';

interface InputRowProps {
  label: string;
  sub?: React.ReactNode;
  val: number | string;
  suffix?: string;
  onChange: (v: string) => void;
  step?: string;
  colorSub?: string;
  min?: string;
  max?: string;
}

export function InputRow({ label, sub, val, suffix, onChange, step, colorSub, min, max }: InputRowProps) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-[var(--color-border-light)] gap-2 last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="text-[11.5px] font-medium text-[var(--color-txt)] leading-[1.3]">{label}</div>
        {sub && <div className="text-[9.5px] mt-0.5" style={{ color: colorSub || 'var(--color-txt3)' }}>{sub}</div>}
      </div>
      <div className="flex items-center gap-1.5 self-center">
        <input 
          type="number" 
          value={val} 
          onChange={e => onChange(e.target.value)}
          step={step}
          min={min}
          max={max}
          className="w-[68px] sm:w-[104px] p-1.5 bg-[var(--color-bg2)] border border-[var(--color-border-main)] rounded-md text-[var(--color-gold-l)] font-jetbrains text-[12px] font-semibold text-right outline-none focus:border-[var(--color-gold)] focus:ring-2 focus:ring-[var(--color-gold-d)] disabled:opacity-45 disabled:cursor-not-allowed"
        />
        {suffix && (
          <span className="font-jetbrains text-[9px] text-[var(--color-txt3)] px-1.5 py-0.5 bg-[var(--color-bg)] rounded-[3px] border border-[var(--color-border-light)] whitespace-nowrap">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
