import {IInjection} from 'jetli';
import SuperAgent, {Request, Response} from 'superagent';
import {HttpMethod, ProxyOverwriteCallback} from '../types';
import {GenericDataStore} from './generic-data-store.class';

/**
 * Proxy that decides which requests to pass to http agent
 * and which one should be resolved internally by mocked components
 */
export class HttpProxyService implements IInjection {
    public initialised = false;
    protected overwrites: GenericDataStore = new GenericDataStore();
    protected client = SuperAgent;

    /**
     * Initialise http proxy service
     * @return {Promise<void>}
     */
    public async init(): Promise<void> {
        this.initialised = true;
        // tslint:disable-next-line
        console.log('HttpProxyService: ready');
    }

    /**
     * Resolves GET http request
     * @param {string} url
     * @param headers
     * @param payload
     * @return {Promise<RESPONSE>}
     */
    public async get<RESPONSE = any>(url: string, headers?: any, payload?: any): Promise<RESPONSE> {
        return this.resolveRequest<RESPONSE>('GET', url, headers, payload);
    }

    /**
     * Resolves POST http request
     * @param {string} url
     * @param headers
     * @param payload
     * @return {Promise<RESPONSE>}
     */
    public async post<RESPONSE = any>(url: string, headers?: any, payload?: any): Promise<RESPONSE> {
        return this.resolveRequest<RESPONSE>('POST', url, headers, payload);
    }

    /**
     * Resolves PUT http request
     * @param {string} url
     * @param headers
     * @param payload
     * @return {Promise<RESPONSE>}
     */
    public async put<RESPONSE = any>(url: string, headers?: any, payload?: any): Promise<RESPONSE> {
        return this.resolveRequest<RESPONSE>('PUT', url, headers, payload);
    }

    /**
     * Resolves DELETE http request
     * @param {string} url
     * @param headers
     * @param payload
     * @return {Promise<RESPONSE>}
     */
    public async delete<RESPONSE = any>(url: string, headers?: any, payload?: any): Promise<RESPONSE> {
        return this.resolveRequest<RESPONSE>('DELETE', url, headers, payload);
    }

    /**
     * Unset url that should be overwritten
     * @param {"GET" | "POST" | "PUT" | "DELETE"} method
     * @param {string} pattern
     */
    public unsetOverwrite(
        method: HttpMethod,
        pattern: string
    ): void {
        this.overwrites.delete(method, pattern);
    }

    /**
     * Set url that should be overwritten
     * @param {"GET" | "POST" | "PUT" | "DELETE"} method
     * @param {string} pattern
     * @param {ProxyOverwriteCallback} callback
     */
    public setOverwrite(
        method: HttpMethod,
        pattern: string,
        callback: ProxyOverwriteCallback
    ): void {
        this.overwrites.set(method, pattern, callback);
    }

    /**
     * Resolve http request
     * @param {"GET" | "POST" | "PUT" | "DELETE"} method
     * @param {string} url
     * @param headers
     * @param payload
     * @return {Promise<RESPONSE>}
     */
    protected resolveRequest<RESPONSE = any>(
        method: HttpMethod,
        url: string,
        headers?: any,
        payload?: any
    ): Promise<RESPONSE> {
        const overwrite = this.overwrites.get<ProxyOverwriteCallback>(method, url);

        if (overwrite) {
            return overwrite(method, url, headers, payload);
        }

        return this.passTrough(method, url, headers, payload);
    }

    /**
     * Pass the request to the http agent
     * @param {HttpMethod} method
     * @param {string} url
     * @param headers
     * @param payload
     * @return {Promise<RESPONSE>}
     */
    protected async passTrough<RESPONSE = any>(
        method: HttpMethod,
        url: string,
        headers?: any,
        payload?: any
    ): Promise<RESPONSE> {

        let request: Request;
        switch (method) {
            case 'GET':
                request = this.client.get(url);
                break;
            case 'POST':
                request = this.client.post(url);
                break;
            case 'PUT':
                request = this.client.put(url);
                break;
            case 'DELETE':
                request = this.client.delete(url);
                break;
            default:
                throw new Error(`Unknown method provided: ${method}`);
        }

        if (headers) {
            for (const headerEntry of Object.entries(headers)) {
                request.set(headerEntry[0], headerEntry[1] as any);
            }
        }

        let response: Response;

        try {
            if (payload) {
                response = await request.send(payload);
            } else {
                response = await request.send();
            }
        } catch (error) {
            throw error;
        }

        if (response.error) {
            throw new Error(JSON.stringify(response.error));
        }

        return response.body;
    }
}
