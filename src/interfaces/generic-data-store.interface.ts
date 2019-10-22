export interface IGenericDataStore<ENTRY = any> {
    [namespaceKey: string]: {
        [entryKey: string]: ENTRY
    };
}
