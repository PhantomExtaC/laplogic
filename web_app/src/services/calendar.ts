import { getCalendarResource } from '../data/services';
export async function getCalendar() { return (await getCalendarResource()).data; }
