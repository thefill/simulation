import express, {Application} from 'express';
import {IInjection} from 'jetli';

/**
 * Server service
 */
export class ServerService implements IInjection {
    public initialised = false;
    protected server: Application = express();
    protected port = 3000;

    constructor() {
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
        console.log(`ServerService: ready | listening on port ${this.port}`);
    }

    /**
     * Setup routes
     */
    protected setupRoutes() {
        // TODO: add control routes
    }

    /**
     * Start a server
     * @return {Promise<void>}
     */
    protected async startServer(): Promise<void> {
        await new Promise((resolve) => {
            this.server.listen(this.port, () => {
                resolve();
            });
        });
    }
}
