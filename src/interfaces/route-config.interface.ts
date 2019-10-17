import {HttpMethod} from '../enums';
import {ServerRequestCallback} from '../types';

export interface IRouteConfig {
    route: string;
    method: HttpMethod;
    callback: ServerRequestCallback;
}
