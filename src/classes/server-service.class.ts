import express, {Application, IRouterMatcher} from 'express';
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
        await this.startServer();
        this.initialised = true;
        // tslint:disable-next-line
        console.log(`ServerService: ready | listening on port ${this.config.port}`);
    }

    /**
     * Setups server
     */
    protected setupServer() {
        this.server.use(express.json());
    }

    /**
     * Setup routes
     */
    protected setupRoutes() {
        for (const route of this.config.routes!) {
            switch (route.method) {
                case HttpMethod.GET:
                    this.setRoute(this.server.get, route);
                    break;
                case HttpMethod.POST:
                    this.setRoute(this.server.post, route);
                    break;
                case HttpMethod.PUT:
                    this.setRoute(this.server.put, route);
                    break;
                case HttpMethod.DELETE:
                    this.setRoute(this.server.delete, route);
                    break;
                default:
                    throw new Error(`Invalid route method: ${route.method}`);
            }
        }
    }

    protected setRoute(routeHandler: IRouterMatcher<any>, route: IRouteConfig) {
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
