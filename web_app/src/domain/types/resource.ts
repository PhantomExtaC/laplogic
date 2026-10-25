export interface DataMeta {schemaVersion:string;snapshotId:string|null;season:number|null;raceId:string|null;generatedAt:string|null;dataThrough:string|null;placeholder:boolean;source:string}
export interface Resource<T>{meta:DataMeta;data:T}

export type ResourceState<T> = { status: 'loading' } | { status: 'error'; error: Error; retry: () => void } | { status: 'ready'; data: T; meta: DataMeta; isPlaceholder: boolean; isStale: boolean };
