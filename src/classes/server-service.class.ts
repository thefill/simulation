import express, {Application} from 'express';
import {IInjection} from 'jetli';
import {HttpMethod} from '../enums';
import {IServerConfig, ISimulationConfig} from '../interfaces';
import {IRouteConfig} from '../interfaces/route-config.interface';

/**
 * Server service
 */
export class ServerService implements IInjection {
    public initialised = false;
    protected server: Application = express();
    protected config: IServerConfig;

    constructor(config?: IServerConfig) {
        this.applyConfig(config);
        this.setupServer();
        this.setupRoutes();
    }

    /**
     * Initialise server
     * @return {Promise<void>}
     */
    public async init() {
        // start server if enabled
        await this.startServer();
        this.initialised = true;
        // tslint:disable-next-line
        console.log(`ServerService: ready | listening on port ${this.config.port}`);
    }

    /**
     * Set single route
     * @param {IRouteConfig} route
     */
    public setRoute(route: IRouteConfig) {
        // assign route handler
        let routeHandler;
        switch (route.method) {
            case HttpMethod.GET:
                routeHandler = this.server.get;
                break;
            case HttpMethod.POST:
                routeHandler = this.server.post;
                break;
            case HttpMethod.PUT:
                routeHandler = this.server.put;
                break;
            case HttpMethod.DELETE:
                routeHandler = this.server.delete;
                break;
            default:
                throw new Error(`Invalid route method: ${route.method}`);
        }
        // lets make sure we dont loose scope for server
        routeHandler = routeHandler.bind(this.server);

        // set handler
        routeHandler(route.route, async (request, response) => {
            try {
                const callbackResponse = await route.callback(
                    route.method, route.route, request.headers, request.params, request.body
                );
                response.statusCode = callbackResponse.statusCode;
                if (callbackResponse.message) {
                    response.send(callbackResponse.message);
                }
                response.end();
            } catch (error) {
                // tslint:disable-next-line
                console.error(error);
                response.statusCode = 500;
                response.send(error);
                response.end();
            }
        });
    }

    /**
     * Setup routes
     */
    public setRoutes(routes: IRouteConfig[]) {
        for (const route of routes) {
            this.setRoute(route);
        }
    }

    /**
     * Setups server
     */
    protected setupServer() {
        this.server.use(express.json());
    }

    /**
     * Setup tickers from config
     */
    protected setupRoutes() {
        if (this.config.routes) {
            this.setRoutes(this.config.routes);
        }
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
            enabled: true,
            port: 8000,
            routes: []
        };

        if (config) {
            Object.assign(this.config, config);
        }
    }
}
