import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fmt = (v: number, d = 0) => 
  new Intl.NumberFormat('fr-DZ', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);

export const fDZA = (v: number) => fmt(v, 0) + ' DZA';

export const r2m = (r: number) => Math.pow(1 + r, 1 / 12) - 1;

export function pmt(r: number, n: number, pv: number, fv: number) {
  if (r === 0) return (pv - fv) / n;
  const pw = Math.pow(1 + r, n);
  return (pv - fv / pw) * (r / (1 - 1 / pw));
}

export function npv(rate: number, cashflows: number[]): number {
  return cashflows.reduce((acc, val, t) => acc + val / Math.pow(1 + rate, t), 0);
}

export function irr(cashflows: number[], guess = 0.005) {
  let r = guess;
  for (let i = 0; i < 400; i++) {
    let f = 0, df = 0;
    for (let t = 0; t < cashflows.length; t++) {
      const pw = Math.pow(1 + r, t);
      f += cashflows[t] / pw;
      df -= t * cashflows[t] / (pw * (1 + r));
    }
    if (Math.abs(df) < 1e-14) break;
    const rn = r - f / df;
    if (Math.abs(rn - r) < 1e-10) { r = rn; break; }
    r = rn < -0.9999 ? 0.0001 : rn;
  }
  return (isNaN(r) || !isFinite(r)) ? 0 : r;
}
