import {IGenericDataStoreEntry} from './generic-data-store-entry.interface';

export interface IDataStoreConfig {
    // proxy enabled
    enabled?: boolean;
    // http overwrites
    stores: { [dataStoreKey: string]: IGenericDataStoreEntry[] };
}
