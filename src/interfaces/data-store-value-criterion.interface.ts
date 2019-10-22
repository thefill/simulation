export interface IDataStoreValueCriterion {
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'nin' | 'regex';
    value: any;
}
