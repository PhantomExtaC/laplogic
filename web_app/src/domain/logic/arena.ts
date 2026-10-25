import type { ArenaHistory, ArenaRace } from '../types/arena';

export function arenaCohort(history: ArenaHistory, season?: number, stage?: string) {
  const candidates = history.races.filter(row => (season === undefined || row.season === season) && (!stage || stage === 'all' || row.stage === stage))
    .sort((a, b) => a.season - b.season || a.round - b.round || ['pre-weekend', 'post-fp2', 'post-quali'].indexOf(a.stage) - ['pre-weekend', 'post-fp2', 'post-quali'].indexOf(b.stage));
  const reasons = (row: ArenaRace) => [...(row.outcomeWinner === null ? ['Outcome winner unavailable'] : []), ...history.modelIds.flatMap(id => {
    const result = row.results.find(model => model.modelId === id);
    return !result ? [`${id}: missing prediction`] : !result.eligible || result.correct === null || result.predictedWinner === null ? [`${id}: ${result.exclusionReason ?? 'eligibility or correctness unavailable'}`] : [];
  })];
  const eligible = candidates.filter(row => reasons(row).length === 0);
  const excluded = candidates.filter(row => reasons(row).length > 0).map(row => ({ ...row, reasons: reasons(row) }));
  const summaries = history.modelIds.map(id => {
    const correct = eligible.reduce((count, row) => count + (row.results.find(result => result.modelId === id)?.correct === true ? 1 : 0), 0);
    const top3Known = eligible.every(row => row.results.find(result => result.modelId === id)?.top3Covered !== null);
    const top3 = eligible.reduce((count, row) => count + (row.results.find(result => result.modelId === id)?.top3Covered === true ? 1 : 0), 0);
    return { id, correct, denominator: eligible.length, accuracy: eligible.length ? correct / eligible.length : null, top3: eligible.length && top3Known ? top3 / eligible.length : null };
  });
  const points = eligible.map((_row, index) => ({ x: index + 1, values: Object.fromEntries(history.modelIds.map(id => [id,
    eligible.slice(0, index + 1).reduce((count, race) => count + (race.results.find(result => result.modelId === id)?.correct === true ? 1 : 0), 0) / (index + 1) * 100,
  ])) }));
  return { eligible, excluded, summaries, points };
}
