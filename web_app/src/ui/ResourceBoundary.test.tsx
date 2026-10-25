import {it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {ResourceBoundary} from './ResourceBoundary';
import {legacyMeta} from '../data/adapters';
import {DataError} from '../data/client/fetchJson';
it('renders loading and retry states',()=>{expect(renderToStaticMarkup(<ResourceBoundary state={{status:'loading'}}>{()=>null}</ResourceBoundary>)).toContain('Loading');expect(renderToStaticMarkup(<ResourceBoundary state={{status:'error',error:new DataError('network','Offline'),retry:()=>{}}}>{()=>null}</ResourceBoundary>)).toContain('Retry');});
it('labels sample data iff requested',()=>{for(const placeholder of [true,false]){const html=renderToStaticMarkup(<ResourceBoundary state={{status:'ready',meta:{...legacyMeta,placeholder},isPlaceholder:placeholder,isStale:true,data:0}}>{n=><span>{n}</span>}</ResourceBoundary>);expect(html.includes('SAMPLE DATA')).toBe(placeholder);expect(html).toContain('>0<');expect(html).not.toContain('STALE / UNVERIFIED');}});
