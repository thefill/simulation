import {ICronConfig} from './cron-config.interface';
import {IDataStoreConfig} from './data-store-config.interface';
import {IHttpProxyConfig} from './http-proxy-config.interface';
import {IServerConfig} from './server-config.interface';

export interface ISimulationConfig {
    // datastore config
    datastore?: IDataStoreConfig;
    // server config
    server?: IServerConfig;
    // http proxy config
    httpProxy?: IHttpProxyConfig;
    // cron config
    cron?: ICronConfig;
}
