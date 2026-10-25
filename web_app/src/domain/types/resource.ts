export interface DataMeta {schemaVersion:string;snapshotId:string|null;season:number|null;raceId:string|null;generatedAt:string|null;dataThrough:string|null;placeholder:boolean;source:string}
export interface Resource<T>{meta:DataMeta;data:T}
