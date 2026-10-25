import {afterEach,it,expect,vi} from 'vitest';
import {z} from 'zod';
import {fetchJson} from './fetchJson';
afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers();});
it('validates responses and preserves zero',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('{"n":0}')));expect(await fetchJson('data/test.json',z.object({n:z.number()}))).toEqual({n:0});});
it('classifies malformed JSON, schema and HTTP failures',async()=>{for(const [response,kind] of [[new Response('no'),'parse'],[new Response('{"n":null}'),'schema'],[new Response('',{status:503}),'http']] as const){vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response));await expect(fetchJson('data/test.json',z.object({n:z.number()}))).rejects.toMatchObject({kind});}});
it('classifies network errors',async()=>{vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new TypeError('offline')));await expect(fetchJson('data/test.json',z.number())).rejects.toMatchObject({kind:'network'});});
