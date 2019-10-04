import {HttpMethod} from '../enums';
import {ServerRequestCallback} from '../types';

export interface IServerConfig {
    // server port
    port: number;
    routes?: Array<{
        route: string;
        method: HttpMethod;
        callback: ServerRequestCallback
    }>;
}
