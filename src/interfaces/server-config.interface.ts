import {IRouteConfig} from './route-config.interface';

export interface IServerConfig {
    // server enabled
    enabled?: boolean;
    // server port
    port: number;
    // server routes
    routes?: IRouteConfig[];
}
