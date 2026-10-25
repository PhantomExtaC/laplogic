import { SectionHeader, Surface } from '../ui/Surface';
import { InfoPopover } from '../ui/InfoPopover';

export default function Methodology() {
  return <div className="page space-y-6"><SectionHeader title="Methodology & sources" level={1} kicker="LapLogic / Transparency" />
    <Surface title="Read the output with its context"><div className="max-w-prose space-y-4 text-text-muted"><p>LapLogic displays static exports from its analytics engine. A prediction is meaningful only alongside its event, model version, stage and snapshot. Unavailable context is marked unverified.</p><p>Win probabilities are displayed as exported. A truncated field is not renormalized to 100%. A missing value is unavailable, while a recorded zero remains zero.</p><p>Evaluation runs currently disagree on the champion. Model promotion is withheld until a shared cohort, date range and metric definitions can be established.</p></div></Surface>
    <Surface title="Data sources"><div id="sources" className="max-w-prose space-y-4 text-text-muted"><p>Telemetry and weather are exported by the engine through FastF1. Driver and circuit directories, calendar, standings and model outputs are supplied as repository JSON exports. Export timestamps and session provenance are not present in every legacy file.</p><p>Each section identifies missing freshness information. SAMPLE DATA labels identify placeholder contracts; they do not establish real model performance.</p></div></Surface>
    <InfoPopover label="What does stale or unverified mean?">A resource lacks a verified generation timestamp or cannot be matched to the active manifest snapshot. Weather and telemetry cannot be combined with a prediction until event and snapshot identifiers match.</InfoPopover>
  </div>;
}
