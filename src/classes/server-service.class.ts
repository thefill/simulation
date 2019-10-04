import express, {Application} from 'express';
import {IInjection} from 'jetli';
import {IServerConfig, ISimulationConfig} from '../interfaces';

/**
 * Server service
 */
export class ServerService implements IInjection {
    public initialised = false;
    protected server: Application = express();
    protected config: IServerConfig;

    constructor(config?: IServerConfig) {
        this.applyConfig(config);
        this.setupRoutes();
    }

    /**
     * Initialise server
     * @return {Promise<void>}
     */
    public async init() {
        await this.startServer();
        this.initialised = true;
        // tslint:disable-next-line
        console.log(`ServerService: ready | listening on port ${this.config.port}`);
    }

    /**
     * Setup routes
     */
    protected setupRoutes() {
        // TODO: add control routes
        //  status route
        //  put / get / delete / post
    }

    /**
     * Start a server
     * @return {Promise<void>}
     */
    protected async startServer(): Promise<void> {
        await new Promise((resolve) => {
            this.server.listen(this.config.port, () => {
                resolve();
            });
        });
    }

    /**
     * Apply config
     * @param {ISimulationConfig} config
     */
    protected applyConfig(config?: IServerConfig) {
        this.config = {
            port: 8000,
            routes: []
        };

        if (config) {
            Object.assign(this.config, config);
        }
    }
}
