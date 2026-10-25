import {useResource} from '../data/hooks/useResource';
import {getPredictionsResource} from '../data/services';
import {probabilityCoverage} from '../domain/logic';
import {ResourceBoundary} from './ResourceBoundary';
export function PredictionResource(){const state=useResource(getPredictionsResource);return <ResourceBoundary state={state}>{rows=>{const coverage=probabilityCoverage(rows);return <><p className="mb-4 text-sm text-neutral-400">{coverage.count} drivers; field size unavailable · {(coverage.mass*100).toFixed(1)}% probability mass. Raw probabilities, without normalization.</p>{rows.map(row=><div key={row.driverId} className="flex justify-between border-b border-neutral-800 py-3"><span>{row.driverName}</span><span className="font-mono">{(row.winProbability*100).toFixed(1)}%</span></div>)}</>;}}</ResourceBoundary>;}
