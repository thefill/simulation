import {HttpMethod} from '../enums';
import {ProxyOverwriteCallback} from '../types';

export interface IHttpProxyOverwrite {
    // whole url or start of url
    url: string;
    // method override applies for
    method: HttpMethod;
    // callback used to retrieve response for this overwrite
    callback: ProxyOverwriteCallback;
}
