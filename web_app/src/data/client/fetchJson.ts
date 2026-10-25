import type {z} from 'zod';
export class DataError extends Error {
 readonly kind:string;
 constructor(kind:string,message:string){super(message);this.name='DataError';this.kind=kind;}
}
export async function fetchJson<T>(path:string,schema:z.ZodType<T>,signal?:AbortSignal):Promise<T>{
 const controller=new AbortController();
 const abort=()=>controller.abort();
 signal?.addEventListener('abort',abort,{once:true});
 if(signal?.aborted)abort();
 let timeout=false;
 const timer=setTimeout(()=>{timeout=true;controller.abort();},12000);
 try{
 const response=await fetch(`${import.meta.env.BASE_URL}${path.replace(/^\//,'')}`,{signal:controller.signal});
 if(!response.ok)throw new DataError('http',`${path}: HTTP ${response.status}`);
 let raw:unknown;
 try{raw=await response.json();}catch{throw new DataError('parse',`${path}: invalid JSON`);}
 const result=schema.safeParse(raw);
 if(!result.success)throw new DataError('schema',`${path}: ${result.error.message}`);
 return result.data;
 }catch(error){if(signal?.aborted)throw error;if(timeout)throw new DataError('timeout','Request timed out');if(error instanceof DataError)throw error;throw new DataError('network',`Unable to load ${path}`);}
 finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
