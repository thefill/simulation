import {IHttpProxyOverwrite} from './http-proxy-overwrite.interface';

export interface IHttpProxyConfig {
    // proxy enabled
    enabled?: boolean;
    // http overwrites
    overwrites?: IHttpProxyOverwrite[];
}
