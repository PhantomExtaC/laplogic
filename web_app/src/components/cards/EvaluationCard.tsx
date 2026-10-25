import SectionCard from './SectionCard';
import {useResource} from '../../data/hooks/useResource';
import {getEvaluation} from '../../data/services';
import {ResourceBoundary} from '../../ui/ResourceBoundary';
export default function EvaluationCard(){const state=useResource(getEvaluation);return <SectionCard title="Evaluation audit"><ResourceBoundary state={state}>{data=><div>{data.conflict?<p role="alert" className="text-amber-400">Conflicting evaluation runs. Champion selection is withheld until the engine owner reconciles the runs.</p>:<p>Champion: {data.championId??'Unavailable'}</p>}<p className="mt-3 text-sm text-neutral-400">Legacy runs lack date ranges, snapshot IDs and agreed metric definitions.</p></div>}</ResourceBoundary></SectionCard>;}
