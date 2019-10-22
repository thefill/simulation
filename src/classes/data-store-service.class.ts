import {IInjection} from 'jetli';
import {IDataStoreConfig} from '../interfaces';
import {GenericDataStore} from './generic-data-store.class';

/**
 * Data-store service
 */
export class DataStoreService implements IInjection {
    public initialised = false;
    protected config: IDataStoreConfig;
    protected dataStores: { [dataStoreKey: string]: GenericDataStore } = {};

    constructor(config?: IDataStoreConfig) {
        this.applyConfig(config);
        this.setupStores();
    }

    /**
     * Initialise data-store service
     * @return {Promise<void>}
     */
    public async init(): Promise<void> {
        this.initialised = true;
        // tslint:disable-next-line
        console.log('DataStoreService: ready');
    }

    /**
     * Set entry in data-store
     * @param {string | number} dataStoreKey
     * @param {string | number} namespaceKey
     * @param {string | number} entryKey
     * @param entry
     * @return {string | number}
     */
    public set(
        dataStoreKey: string | number,
        namespaceKey: string | number,
        entryKey?: string | number,
        entry?: any
    ): string | number | void {
        if (!dataStoreKey && dataStoreKey !== 0) {
            return;
        }
        const dataStore = this.getDataStore(dataStoreKey);

        return dataStore.set(namespaceKey, entryKey, entry);
    }

    /**
     * Get entry from data-store
     * @param {string | number} dataStoreKey
     * @param {string | number} namespaceKey
     * @param {string | number} entryKey
     * @return {void | ENTRY}
     */
    public get<ENTRY = any>(
        dataStoreKey: string | number,
        namespaceKey?: string | number,
        entryKey?: string | number
    ): ENTRY | void {
        if (typeof dataStoreKey === 'undefined') {
            return;
        }
        const dataStore = this.getDataStore(dataStoreKey);

        // if no entry key or namespace
        if (typeof namespaceKey === 'undefined' || typeof entryKey === 'undefined') {
            if (typeof namespaceKey === 'undefined') {
                // return whole datastore
                return dataStore.getAll() as any;
            }

            // if namespace provided and no entry key return namespace
            return dataStore.getNamespace(namespaceKey) as any;
        }

        return dataStore.get(namespaceKey, entryKey);
    }

    /**
     * Delete entry from data-store
     * @param {string | number} dataStoreKey
     * @param {string | number} namespaceKey
     * @param {string | number} entryKey
     */
    public delete(
        dataStoreKey: string | number,
        namespaceKey: string | number,
        entryKey?: string | number
    ): void {
        if (!dataStoreKey && dataStoreKey !== 0) {
            return;
        }

        if (!namespaceKey && namespaceKey !== 0) {
            delete this.dataStores[dataStoreKey];
            return;
        }

        const dataStore = this.getDataStore(dataStoreKey);

        return dataStore.delete(namespaceKey, entryKey);
    }

    /**
     * Get data-store, if dont exist create new one and return
     * @param {string} dataStoreKey
     * @return {{[p: string]: any}}
     */
    protected getDataStore(dataStoreKey: string | number): GenericDataStore {
        if (!this.dataStores[dataStoreKey]) {
            this.dataStores[dataStoreKey] = new GenericDataStore();
        }
        return this.dataStores[dataStoreKey];
    }

    protected setupStores() {
        if (this.config.stores) {
            for (const [storeKey, storeEntries] of Object.entries(this.config.stores)) {
                for (const entry of storeEntries) {
                    this.set(storeKey, entry.namespaceKey, entry.entryKey, entry.entry);
                }
            }
        }
    }

    /**
     * Apply config
     * @param {ISimulationConfig} config
     */
    protected applyConfig(config?: IDataStoreConfig) {
        this.config = {
            enabled: true,
            stores: {}
        };

        if (config) {
            Object.assign(this.config, config);
        }
    }
}
