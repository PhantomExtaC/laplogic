import type {z} from 'zod';
import type {calendarSchema} from '../data/schemas';
export type RaceEvent=z.infer<typeof calendarSchema>[number];
