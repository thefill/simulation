import {IInjection} from 'jetli';
import SuperAgent, {Request, Response} from 'superagent';
import {HttpMethod} from '../enums';
import {IHttpProxyConfig, IHttpProxyOverwrite} from '../interfaces';
import {ProxyOverwriteCallback} from '../types';
import {GenericDataStore} from './generic-data-store.class';

/**
 * Proxy that decides which requests to pass to http agent
 * and which one should be resolved internally by mocked components
 */
export class HttpProxyService implements IInjection {
    public initialised = false;
    protected overwrites: GenericDataStore = new GenericDataStore();
    protected client = SuperAgent;
    protected config: IHttpProxyConfig;

    constructor(config?: IHttpProxyConfig) {
        this.applyConfig(config);
        this.setupOverwrites();
    }

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
        return this.resolveRequest<RESPONSE>(HttpMethod.GET, url, headers, payload);
    }

    /**
     * Resolves POST http request
     * @param {string} url
     * @param headers
     * @param payload
     * @return {Promise<RESPONSE>}
     */
    public async post<RESPONSE = any>(url: string, headers?: any, payload?: any): Promise<RESPONSE> {
        return this.resolveRequest<RESPONSE>(HttpMethod.POST, url, headers, payload);
    }

    /**
     * Resolves PUT http request
     * @param {string} url
     * @param headers
     * @param payload
     * @return {Promise<RESPONSE>}
     */
    public async put<RESPONSE = any>(url: string, headers?: any, payload?: any): Promise<RESPONSE> {
        return this.resolveRequest<RESPONSE>(HttpMethod.PUT, url, headers, payload);
    }

    /**
     * Resolves DELETE http request
     * @param {string} url
     * @param headers
     * @param payload
     * @return {Promise<RESPONSE>}
     */
    public async delete<RESPONSE = any>(url: string, headers?: any, payload?: any): Promise<RESPONSE> {
        return this.resolveRequest<RESPONSE>(HttpMethod.DELETE, url, headers, payload);
    }

    /**
     * Unset url that should be overwritten
     * @param {"GET" | "POST" | "PUT" | "DELETE"} method
     * @param {string} url
     */
    public unsetOverwrite(method: HttpMethod, url: string): void {
        this.overwrites.delete(method, url);
    }

    /**
     * Set url that should be overwritten
     * @param {"GET" | "POST" | "PUT" | "DELETE"} method
     * @param {string} url
     * @param {ProxyOverwriteCallback} callback
     */
    public setOverwrite(method: HttpMethod, url: string, callback: ProxyOverwriteCallback): void {
        this.overwrites.set(method, url, callback);
    }

    /**
     * Set multiple overwrites
     * @param {IHttpProxyOverwrite[]} overwrites
     */
    public setOverwrites(overwrites: IHttpProxyOverwrite[]) {
        for (const overwrite of overwrites) {
            this.setOverwrite(overwrite.method, overwrite.url, overwrite.callback);
        }
    }

    /**
     * Setup initial overwrites
     */
    protected setupOverwrites() {
        // set provided overwrites
        if (this.config.overwrites) {
            this.setOverwrites(this.config.overwrites);
        }
    }

    /**
     * Resolve http request
     * @param {"GET" | "POST" | "PUT" | "DELETE"} method
     * @param {string} url
     * @param headers
     * @param payload
     * @return {Promise<RESPONSE>}
     */
    protected resolveRequest<RESPONSE = any>(method: HttpMethod, url: string, headers?: any, payload?: any
    ): Promise<RESPONSE> {
        let overwrite = this.overwrites.get<ProxyOverwriteCallback>(method, url);

        // if no overwrite for the url then find url that starts with this string
        if (!overwrite) {
            const namespaceStoreQueryResult = this.overwrites.query<ProxyOverwriteCallback>(
                method, [{operator: 'regex', value: new RegExp(url)}]
            );
            // if result returned take first from the list
            if (namespaceStoreQueryResult && namespaceStoreQueryResult.length) {
                overwrite = namespaceStoreQueryResult[0];
            }
        }

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
        method: HttpMethod, url: string, headers?: any, payload?: any
    ): Promise<RESPONSE> {

        let request: Request;
        switch (method) {
            case HttpMethod.GET:
                request = this.client.get(url);
                break;
            case HttpMethod.POST:
                request = this.client.post(url);
                break;
            case HttpMethod.PUT:
                request = this.client.put(url);
                break;
            case HttpMethod.DELETE:
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

    /**
     * Apply config
     * @param {ISimulationConfig} config
     */
    protected applyConfig(config?: IHttpProxyConfig) {
        this.config = {
            overwrites: []
        };

        if (config) {
            Object.assign(this.config, config);
        }
    }
}
