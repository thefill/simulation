import {IRouteConfig} from './route-config.interface';

export interface IServerConfig {
    // server port
    port: number;
    // server routes
    routes?: IRouteConfig[];
}
