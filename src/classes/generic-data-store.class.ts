import uuid from 'uuid/v3';
import {
    IDataStorePropertyCriterion,
    IDataStoreValueCriterion,
    IGenericDataStore,
    IGenericDataStoreEntry
} from '../interfaces';

/**
 * Generic data-store
 */
export class GenericDataStore {
    protected data: IGenericDataStore = {};

    /**
     * Set entry in namespace
     * @param {string | number} namespaceKey
     * @param {string | number} entryKey
     * @param entry
     * @return {string | number}
     */
    public set(namespaceKey: string | number, entryKey?: string | number, entry?: any): string | number | void {
        if (!namespaceKey && namespaceKey !== 0) {
            return;
        }

        const namespace = this.getNamespace(namespaceKey);

        if (!entryKey && entryKey !== 0) {
            entryKey = uuid() as string;
        }

        namespace[entryKey] = entry;

        return entryKey;
    }

    /**
     * Set multiple entries in store
     * @param {IGenericDataStoreEntry[]} entries
     */
    public setMultiple(entries: IGenericDataStoreEntry[]) {
        for (const entry of entries) {
            this.set(entry.namespaceKey, entry.entryKey, entry.entry);
        }
    }

    /**
     * Get entry from namespace
     * @param {string | number} namespaceKey
     * @param {string | number} entryKey
     * @return {void | ENTRY}
     */
    public get<ENTRY = any>(namespaceKey: string | number, entryKey: string | number): ENTRY | void {
        if ((!namespaceKey && namespaceKey !== 0) || (namespaceKey && !this.data[namespaceKey])) {
            return;
        }

        if ((!entryKey && entryKey !== 0) || (entryKey && !this.data[namespaceKey][entryKey])) {
            return;
        }

        return this.data[namespaceKey][entryKey];
    }

    public query<ENTRY = any>(
        namespaceKey: string | number,
        entryKeyCriteria: IDataStoreValueCriterion[],
        entryContentCriteria?: IDataStorePropertyCriterion[]
    ): ENTRY[] {
        if ((!namespaceKey && namespaceKey !== 0) || (namespaceKey && !this.data[namespaceKey])) {
            return [];
        }
        const namespaceStore = this.data[namespaceKey];

        // search for keys that match criteria
        let entries: ENTRY[] = Object.keys(namespaceStore)
            .filter((key) => {
                // check if key matches criteria
                const resss = this.evaluateCriteria(key, entryKeyCriteria);
                return resss;
            }).map((key) => {
                return namespaceStore[key];
            });

        // if content criteria provided
        if (entryContentCriteria && entryContentCriteria.length) {
            // filter entries by content
            entries = entries.filter((entry) => {
                return this.evaluateCriteria(entry, entryContentCriteria);
            });
        }

        return entries;
    }

    /**
     * Delete entry from namespace
     * @param {string | number} namespaceKey
     * @param {string | number} entryKey
     */
    public delete(namespaceKey: string | number, entryKey?: string | number): void {
        if ((!namespaceKey && namespaceKey !== 0) || (namespaceKey && !this.data[namespaceKey])) {
            return;
        }

        if (!entryKey && entryKey !== 0) {
            delete this.data[namespaceKey];
            return;
        }

        delete this.data[namespaceKey][entryKey!];
    }

    /**
     * Get namespace, if dont exist create new one and return
     * @param {string} namespaceKey
     * @return {{[p: string]: any}}
     */
    public getNamespace(namespaceKey: string | number): { [entryKey: string]: any } {
        if (!this.data[namespaceKey]) {
            this.data[namespaceKey] = {};
        }
        return this.data[namespaceKey];
    }

    /**
     * Get all namespaces
     * @return {IGenericDataStore}
     */
    public getAll(): IGenericDataStore {
        return this.data;
    }

    /**
     * Evaluate multiple criteria against value
     * @param value
     * @param {IDataStoreValueCriterion[]} criteria
     * @return {boolean}
     */
    protected evaluateCriteria(value: any, criteria: IDataStoreValueCriterion[]): boolean {
        return criteria.every((criterion) => {
            // asses according to operator
            switch (criterion.operator) {
                case 'eq':
                    return value === criterion.value;
                case 'gt':
                    return value > criterion.value;
                case 'lt':
                    return value < criterion.value;
                case 'in':
                    return (criterion.value as any[]).includes(value);
                case 'neq':
                    return value !== criterion.value;
                case 'nin':
                    return !(criterion.value as any[]).includes(value);
                case 'regex':
                    return (criterion.value as RegExp).test(value);
                default:
                    return false;
            }
        });
    }
}
