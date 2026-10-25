import { fetchJson, DataError } from '../client/fetchJson';
import { storyIndexSchema, storySchema } from '../schemas/stories';
import { archiveIdSchema } from '../schemas/arena';
export const getStories = (signal?: AbortSignal) => fetchJson('data/stories/index.json', storyIndexSchema, signal);
export async function getStory(id: string, signal?: AbortSignal) {
  if (!archiveIdSchema.safeParse(id).success) throw new DataError('schema', 'Invalid story address.');
  const resource = await fetchJson(`data/stories/${id}.json`, storySchema, signal);
  if (resource.data.id !== id) throw new DataError('schema', 'Story identity does not match its address.');
  return resource;
}
