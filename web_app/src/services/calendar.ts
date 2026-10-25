import {fetchJson} from '../data/client/fetchJson';
import {calendarSchema} from '../data/schemas';
export async function getCalendar(){const data=await fetchJson('data/calendar.json',calendarSchema);return data;}
