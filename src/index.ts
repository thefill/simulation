export * from './classes';
export * from './interfaces';
export * from './types';

import {jetli} from 'jetli';
import {Simulation} from './classes/simulation.class';
import {ISimulationConfig} from './interfaces';

const config: ISimulationConfig = {
    serverEnabled: true,
    // server: {
    //     port: 8000,
    //     routes: [
    //         {
    //             route: string,
    //             method: HttpMethod.GET,
    //             callback: InsertHereBindedMethodFromPodLikeSparx
    //         }
    //     ]
    // },
    // httpProxy: {
    //     overwrites: [{
    //         url: string,
    //         method: HttpMethod.POST,
    //         callback: InsertHereBindedMethodFromPodLikeApiGateway
    //     }]
    // },
    cron: {
        tickers: [{
            eventType: 'donkey',
            emitLimit: 10,
            periodCount: 2,
            period: 's',
            tickerCallback: () => {
                // tslint:disable-next-line
                console.log('tick');
            }
        }]
    }
};

runSimulation(config)
    .then(() => {
        // tslint:disable-next-line
        console.log('App starts...');
    });

async function runSimulation(simulationConfig: ISimulationConfig): Promise<void> {
    await jetli.set('SIMULATION', Simulation, simulationConfig);
    const simulation = await jetli.get('SIMULATION');
}
