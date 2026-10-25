export interface DataMeta {schemaVersion:string;snapshotId:string|null;season:number|null;raceId:string|null;generatedAt:string|null;dataThrough:string|null;placeholder:boolean;source:string;round?:number|null;stage?:string|null;modelId?:string|null;modelVersion?:string|null;fieldSize?:number|null}
export interface Resource<T>{meta:DataMeta;data:T}

export type ResourceState<T> = { status: 'loading' } | { status: 'error'; error: Error; retry: () => void } | { status: 'ready'; data: T; meta: DataMeta; isPlaceholder: boolean; isStale: boolean; manifestMissing?: boolean };
