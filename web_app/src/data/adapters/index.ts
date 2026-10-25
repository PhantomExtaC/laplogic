import type {DataMeta,Resource} from '../../domain/types/resource';
export const legacyMeta:DataMeta={schemaVersion:'legacy',snapshotId:null,season:null,raceId:null,generatedAt:null,dataThrough:null,placeholder:false,source:'legacy export'};
export const legacy=<T>(data:T):Resource<T>=>({data,meta:legacyMeta});
export function resolveDriver(id:string,rows:{canonicalId:string;aliases:string[]}[]){const row=rows.find(r=>r.canonicalId===id||r.aliases.includes(id));if(!row)throw new Error(`Unresolved driver ID: ${id}`);return row.canonicalId;}
export const lapSeconds=(record:{milliseconds:number})=>record.milliseconds;
