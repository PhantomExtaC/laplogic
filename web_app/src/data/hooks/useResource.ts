import {useEffect,useState,useCallback} from 'react';
import {DataError} from '../client/fetchJson';
import type {Resource,ResourceState} from '../../domain/types/resource';
import {getManifest} from '../services';
export type { ResourceState } from '../../domain/types/resource';
export function useResource<T>(loader:(signal:AbortSignal)=>Promise<Resource<T>>):ResourceState<T>{
 const [attempt,setAttempt]=useState(0);const [state,setState]=useState<ResourceState<T>>({status:'loading'});const retry=useCallback(()=>{setState({status:'loading'});setAttempt(n=>n+1);},[]);
 useEffect(()=>{const controller=new AbortController();Promise.all([loader(controller.signal),getManifest(controller.signal).catch(()=>null)]).then(([resource,manifest])=>{if(!controller.signal.aborted)setState({status:'ready',...resource,isPlaceholder:resource.meta.placeholder,isStale:!resource.meta.snapshotId||!resource.meta.generatedAt||!manifest?.data.snapshotId||resource.meta.snapshotId!==manifest.data.snapshotId||(manifest.meta.dataThrough!==null&&manifest.meta.dataThrough!==resource.meta.dataThrough)});}).catch((error:unknown)=>{if(!controller.signal.aborted)setState({status:'error',error:error instanceof DataError?error:new DataError('schema',error instanceof Error?error.message:'Invalid resource'),retry});});return ()=>controller.abort();},[loader,attempt,retry]);return state;
}
