import { useCalendar } from './resources';
import { nextEvent } from '../../domain/logic';

export function useSnapshot(raceId?: string | null) {
  const calendar = useCalendar();
  const event = calendar.status === 'ready'
    ? raceId ? calendar.data.find(row => row.raceId === raceId) ?? null : nextEvent(calendar.data, new Date())
    : null;
  return { calendar, event, selectedRaceMissing: !!raceId && calendar.status === 'ready' && !event };
}
