import {IInjection, jetli} from 'jetli';
import {ISimulationConfig} from '../interfaces';
import {CronService} from './cron-service.class';
import {DataStoreService} from './data-store-service.class';
import {HttpProxyService} from './http-proxy-service.class';
import {ServerService} from './server-service.class';

export class Simulation implements IInjection {
    public initialised = false;
    public serverService: ServerService;
    public eventCronService: CronService;
    public httpProxyService: HttpProxyService;
    public dataStoreService: DataStoreService;
    public config: ISimulationConfig;

    constructor(config?: ISimulationConfig) {
        this.applyConfig(config);
    }

    /**
     * Initialise server
     * @return {Promise<void>}
     */
    public async init() {
        if (this.config.cron && this.config.cron.enabled) {
            this.eventCronService = await jetli.get(CronService, this.config.cron);
        }
        if (this.config.httpProxy && this.config.httpProxy.enabled) {
            this.httpProxyService = await jetli.get(HttpProxyService, this.config.httpProxy);
        }
        if (this.config.datastore && this.config.datastore.enabled) {
            this.dataStoreService = await jetli.get(DataStoreService, this.config.datastore);
        }
        if (this.config.server && this.config.server.enabled) {
            this.serverService = await jetli.get(ServerService, this.config.server);
        }

        this.initialised = true;
        // tslint:disable-next-line
        console.log(`Simulation: ready`);
    }

    /**
     * Apply simulation config
     * @param {ISimulationConfig} config
     */
    protected applyConfig(config?: ISimulationConfig) {
        this.config = {
            // default server config
            datastore: {
                // by default enabled
                enabled: true,
                // by default no stores
                stores: {}
            },
            // default server config
            server: {
                // by default disabled
                enabled: false,
                // default port
                port: 8000,
                // by default no routes
                routes: []
            },
            // default http proxy config
            httpProxy: {
                // by default enabled
                enabled: true,
                // by default no overwrites
                overwrites: []
            },
            cron: {
                // by default enabled
                enabled: true,
                // by default no tickers
                tickers: []
            }
        };

        if (config) {
            Object.assign(this.config, config);
        }
    }
}
