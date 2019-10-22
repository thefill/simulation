import {IDataStoreValueCriterion} from './data-store-value-criterion.interface';

export interface IDataStorePropertyCriterion extends IDataStoreValueCriterion {
    property?: string | number;
}
