import uuid from 'uuid/v3';

/**
 * Generic data-store
 */
export class GenericDataStore {
    protected data: { [namespaceKey: string]: { [entryKey: string]: any } } = {};

    /**
     * Set entry in namespace
     * @param {string | number} namespaceKey
     * @param {string | number} entryKey
     * @param entry
     * @return {string | number}
     */
    public set(namespaceKey: string | number, entryKey?: string | number, entry?: any): string | number {
        const namespace = this.getNamespace(namespaceKey);

        if (!entryKey && entryKey !== 0) {
            entryKey = uuid() as string;
        }

        namespace[entryKey] = entry;

        return entryKey;
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
        }

        delete this.data[namespaceKey][entryKey!];
    }

    /**
     * Get namespace, if dont exist create new one and return
     * @param {string} namespaceKey
     * @return {{[p: string]: any}}
     */
    protected getNamespace(namespaceKey: string | number): { [entryKey: string]: any } {
        if (!this.data[namespaceKey]) {
            this.data[namespaceKey] = {};
        }
        return this.data[namespaceKey];
    }
}
