import {HttpMethod} from '../enums';
import {ProxyOverwriteCallback} from '../types';

export interface IHttpProxyConfig {
    // http overwrites
    overwrites: Array<{
        url: string,
        method: HttpMethod,
        callback: ProxyOverwriteCallback
    }>;
}
