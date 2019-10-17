import {ICronConfig} from './cron-config.interface';
import {IHttpProxyConfig} from './http-proxy-config.interface';
import {IServerConfig} from './server-config.interface';

export interface ISimulationConfig {
    // should we enable server
    serverEnabled?: boolean;
    // server config
    server?: IServerConfig;
    // http proxy config
    httpProxy?: IHttpProxyConfig;
    // cron config
    cron?: ICronConfig;
}
