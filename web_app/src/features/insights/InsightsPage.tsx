import { useCallback, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { z } from 'zod';
import type { storySchema } from '../../data/schemas/stories';
import { getStories, getStory } from '../../data/services/stories';
import { useResource } from '../../data/hooks/useResource';
import { useFrozenSnapshot, useOutcome } from '../../data/hooks/arena';
import { Surface, SectionHeader } from '../../ui/Surface';
import { ResourceBoundary } from '../../ui/ResourceBoundary';
import { Select } from '../../ui/Controls';
import { Delta, Num } from '../../ui/Indicators';
import { DataTable } from '../../ui/DataTable';
import { EmptyState } from '../../ui/States';

function FrozenChart({ snapshotId, summary }: { snapshotId: string; summary: string }) {
  const state = useFrozenSnapshot(snapshotId);
  return <Surface title="Frozen model picks"><p className="mb-4 text-text-muted text-sm">{summary}</p><ResourceBoundary state={state}>{data => <DataTable rows={data.predictions} rowKey={row => row.modelId} caption="Original snapshot model picks" columns={[{ key: 'model', label: 'Model / version', render: row => `${row.modelId} / ${row.modelVersion ?? 'unavailable'}` }, { key: 'pick', label: 'Winner pick (ID)', render: row => row.predictedWinner ?? '—' }, { key: 'probability', label: 'Win probability (%)', numeric: true, render: row => <Num value={row.winProbability === null ? null : row.winProbability * 100} digits={1} /> }]} />}</ResourceBoundary></Surface>;
}
function Audit({ snapshotId, outcomeId, raceId }: { snapshotId: string; outcomeId: string; raceId: string }) {
  const frozen = useFrozenSnapshot(snapshotId), outcome = useOutcome(outcomeId);
  return <Surface title="Frozen picks vs actual outcome"><ResourceBoundary state={frozen}>{picks => <ResourceBoundary state={outcome}>{actual => picks.raceId !== raceId || actual.raceId !== raceId ? <EmptyState title="Audit suppressed" description="The story, frozen picks and outcome do not share an event." /> : <><p className="mb-4 text-sm text-text-muted">Recorded winner (ID): {actual.winnerId ?? 'unavailable'}. Sample outcomes are illustrative.</p><DataTable rows={picks.predictions} rowKey={row => row.modelId} caption="Frozen pre-race picks compared with the separately recorded outcome" columns={[{ key: 'model', label: 'Model', render: row => row.modelId }, { key: 'pick', label: 'Frozen pick', render: row => row.predictedWinner ?? '—' }, { key: 'outcome', label: 'Outcome', render: row => row.predictedWinner === null || actual.winnerId === null ? 'Unresolved' : row.predictedWinner === actual.winnerId ? 'Correct' : 'Incorrect' }]} /><Link className="button mt-4" to={`/arena/outcomes/${outcomeId}`}>Open outcome record</Link></>}</ResourceBoundary>}</ResourceBoundary></Surface>;
}
type Story = z.infer<typeof storySchema>['data'];
function Article({ story }: { story: Story }) {
  useEffect(() => {
    document.title = `${story.title} — LapLogic`;
    const restore: (() => void)[] = [];
    for (const [key, value] of [['description', story.summary], ['og:title', story.title], ['og:description', story.summary], ['og:url', window.location.href], ['og:type', 'article']]) {
      const attribute = key.startsWith('og:') ? 'property' : 'name';
      let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      const existed = meta !== null, previous = meta?.content ?? '';
      if (!meta) { meta = document.createElement('meta'); meta.setAttribute(attribute, key); document.head.append(meta); }
      meta.content = value; const node = meta;
      restore.push(() => { if (existed) node.content = previous; else node.remove(); });
    }
    return () => { restore.forEach(fn => fn()); };
  }, [story]);
  return <article className="space-y-6"><SectionHeader level={1} title={story.title} kicker={`Insights / ${story.type}`} asOf={story.summary} />
    <Surface><p className="text-sm text-text-muted break-words">Published {story.publishedAt} · {story.eventName}<br />Original snapshot {story.snapshotId}<br />Model {story.modelId} / {story.modelVersion ?? 'version unavailable'}</p></Surface>
    {story.blocks.map((block, index) => block.type === 'heading' ? <h2 className="text-xl font-semibold" key={index}>{block.text}</h2> : block.type === 'paragraph' ? <p className="max-w-3xl leading-relaxed text-text-muted" key={index}>{block.text}</p> : block.type === 'delta' ? <Surface key={index} title={block.label}><div className="flex flex-wrap gap-4"><span>Before <Num value={block.before === null ? null : block.before * 100} digits={1} unit="%" /></span><span>After <Num value={block.after === null ? null : block.after * 100} digits={1} unit="%" /></span><Delta before={block.before} after={block.after} /></div></Surface> : <Audit key={index} snapshotId={story.snapshotId} outcomeId={block.outcomeId} raceId={story.raceId} />)}
    {story.chartRefs.map(chart => <FrozenChart key={chart.snapshotId} {...chart} />)}
    <div className="flex flex-wrap gap-3"><Link className="button" to={`/arena/snapshots/${story.snapshotId}`}>Open original snapshot</Link><Link className="button" to="/insights">Back to archive</Link>{story.socialLinks.map(link => <a className="button" key={link.url} href={link.url} rel="noreferrer" target="_blank">{link.label}</a>)}</div>
  </article>;
}
function StoryPage({ id }: { id: string }) {
  const state = useResource(useCallback((signal: AbortSignal) => getStory(id, signal), [id]));
  return <div className="page space-y-6"><ResourceBoundary state={state}>{story => <Article story={story} />}</ResourceBoundary></div>;
}
function Archive() {
  const state = useResource(getStories), [params, setParams] = useSearchParams();
  const type = params.get('type') ?? '', race = params.get('race') ?? '';
  const update = (key: string, value: string) => { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); setParams(next); };
  return <div className="page space-y-6"><SectionHeader level={1} title="Insights & Audits" kicker="LapLogic / Research archive" asOf="Published stories retain their original model and snapshot. Sample articles demonstrate the archive workflow." /><ResourceBoundary state={state}>{stories => {
    const filtered = stories.filter(row => (!type || row.type === type) && (!race || row.raceId === race));
    return <><Surface><div className="grid gap-4 sm:grid-cols-2"><Select label="Story type" value={type} onChange={e => update('type', e.target.value)}><option value="">All types</option>{['track-profile', 'projection', 'recalibration', 'audit'].map(value => <option key={value}>{value}</option>)}</Select><Select label="Story race" value={race} onChange={e => update('race', e.target.value)}><option value="">All races</option>{[...new Map(stories.map(row => [row.raceId, row.eventName])).entries()].map(([id, name]) => <option key={id} value={id}>{name}</option>)}</Select></div></Surface>
      <div className="grid gap-6 md:grid-cols-2">{filtered.map(story => <Surface key={story.id} kicker={story.type} title={story.title}><p className="mb-4 text-sm text-text-muted">{story.summary}</p><p className="mb-5 text-xs text-text-muted">{story.eventName} · {story.publishedAt}</p><Link className="button" to={`/insights/${story.id}`}>Read story</Link></Surface>)}</div>{filtered.length === 0 && <EmptyState title="No stories match" description="Choose another race or story type." />}</>;
  }}</ResourceBoundary></div>;
}
export default function InsightsPage() { const { storyId } = useParams(); return storyId ? <StoryPage id={storyId} /> : <Archive />; }
