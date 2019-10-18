interface IDataStoreValueCriterion {
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'in' | 'nin' | 'regex';
    value: any;
}

interface IDataStorePropertyCriterion extends IDataStoreValueCriterion {
    property?: string | number;
}
