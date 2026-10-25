import { z } from 'zod';
import { envelope } from './index';
import { archiveIdSchema } from './arena';
const storyType = z.enum(['track-profile', 'projection', 'recalibration', 'audit']);
const header = { id: archiveIdSchema, type: storyType, raceId: z.string(), eventName: z.string(), publishedAt: z.iso.datetime({ offset: true }), snapshotId: archiveIdSchema, modelId: z.string(), modelVersion: z.string().nullable(), title: z.string(), summary: z.string() };
export const storyIndexSchema = envelope(z.array(z.object(header)));
export const storySchema = envelope(z.object({ ...header,
  blocks: z.array(z.discriminatedUnion('type', [
    z.object({ type: z.literal('paragraph'), text: z.string() }),
    z.object({ type: z.literal('heading'), text: z.string() }),
    z.object({ type: z.literal('delta'), label: z.string(), before: z.number().min(0).max(1).nullable(), after: z.number().min(0).max(1).nullable() }),
    z.object({ type: z.literal('audit'), outcomeId: archiveIdSchema }),
  ])),
  chartRefs: z.array(z.object({ snapshotId: archiveIdSchema, summary: z.string() })),
  socialLinks: z.array(z.object({ label: z.string(), url: z.url().refine(url => /^https?:\/\//.test(url), 'Only HTTP(S) links') })),
})).superRefine((story, ctx) => {
  if (story.meta.snapshotId !== story.data.snapshotId || story.meta.raceId !== story.data.raceId || story.data.chartRefs.some(chart => chart.snapshotId !== story.data.snapshotId)) ctx.addIssue({ code: 'custom', message: 'Story must bind its original event and snapshot' });
});
