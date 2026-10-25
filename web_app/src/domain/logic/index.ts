export function nextEvent<T extends {status:string;date:string;round:number}>(rows:T[],now:Date){const sorted=rows.filter(r=>!['completed','cancelled','postponed'].includes(r.status)).sort((a,b)=>a.date.localeCompare(b.date)||a.round-b.round);return sorted.find(r=>r.status==='in_progress')??sorted.find(r=>r.date>=now.toISOString().slice(0,10))??null;}
export function probabilityCoverage(rows:{winProbability:number}[]){const mass=rows.reduce((sum,r)=>sum+r.winProbability,0);return {count:rows.length,mass,massMissing:1-mass};}
export const pairwiseMatchups=(n:number)=>n*(n-1)/2;
export const formatLapTime=(seconds:number|null)=>seconds===null?'—':`${Math.floor(seconds/60)}:${(seconds%60).toFixed(3).padStart(6,'0')}`;
export const formatPpDelta=(before:number,after:number)=>`${after>=before?'+':''}${((after-before)*100).toFixed(1)} pp`;

export { headToHead } from './comparison';
export type { ComparisonMetric } from '../types/comparison';
