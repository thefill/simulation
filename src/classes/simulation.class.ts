import {IInjection, jetli} from 'jetli';
import {ISimulationConfig} from '../interfaces';
import {DataStoreService} from './data-store-service.class';
import {CronService} from './cron-service.class';
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
        this.eventCronService = await jetli.get(CronService, this.config.cron);
        this.httpProxyService = await jetli.get(HttpProxyService, this.config.httpProxy);
        this.dataStoreService = await jetli.get(DataStoreService);

        if (this.config.serverEnabled) {
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
            // by default server disabled
            serverEnabled: false,
            // default server config
            server: {
                // default port
                port: 8000
            },
            // default http proxy config
            httpProxy: {
                // by default no overwrites
                overwrites: []
            }
        };

        if (config) {
            Object.assign(this.config, config);
        }
    }
}
