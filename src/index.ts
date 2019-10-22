export * from './classes';
export * from './interfaces';
export * from './types';

import {jetli} from 'jetli';
import {Simulation} from './classes/simulation.class';
import {HttpMethod} from './enums';
import {ISimulationConfig} from './interfaces';

const config: ISimulationConfig = {
    datastore: {
        enabled: true,
        stores: {
            'test-store': [
                {namespaceKey: 'donkey', entryKey: 'k1', entry: 1},
                {namespaceKey: 'donkey', entryKey: 'k2', entry: 2},
                {namespaceKey: 'donkey', entryKey: 'k3', entry: 3},
                {namespaceKey: 'donkey1', entryKey: 'k1', entry: 1}
            ],
            'test-store-2': [
                {namespaceKey: 'donkey', entryKey: 'k1', entry: 1},
                {namespaceKey: 'donkey', entryKey: 'k2', entry: 2},
                {namespaceKey: 'donkey', entryKey: 'k3', entry: 3},
                {namespaceKey: 'donkey1', entryKey: 'k1', entry: 1}
            ]
        }
    },
    server: {
        enabled: false,
        port: 8000,
        routes: [
            {
                route: '/test',
                method: HttpMethod.GET,
                callback: async (
                    method: HttpMethod,
                    url: string,
                    headers: any,
                    params: any,
                    payload?: any
                ) => {
                    return {statusCode: 200, message: 'resppp'};
                }
            }
        ]
    },
    httpProxy: {
        enabled: false,
        overwrites: [{
            url: 'www.onet.pl',
            method: HttpMethod.GET,
            callback: async (
                method: 'GET' | 'POST' | 'PUT' | 'DELETE',
                url: string,
                headers?: any,
                payload?: any
            ) => {
                // tslint:disable-next-line
                console.log('http overwrite', method, url, headers, payload);
                return 'mocked www.onet.pl response';
            }
        }]
    },
    cron: {
        enabled: false,
        tickers: [{
            tickerEventId: 'donkey',
            emitLimit: 10,
            periodCount: 2,
            period: 's',
            tickerCallback: () => {
                // tslint:disable-next-line
                console.log('tick');
            }
        }, {
            tickerEventId: 'donkey2',
            emitLimit: 10,
            periodCount: 3000,
            period: 'ms',
            tickerCallback: () => {
                // tslint:disable-next-line
                console.log('tick 2');
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
    const simulation = await jetli.get<Simulation>('SIMULATION');

    // const mockedResult = await simulation.httpProxyService.get('www.onet.pl');
    // tslint:disable-next-line
    // console.log(mockedResult);
    // const unmockedResult = await simulation.httpProxyService.get('www.google.co.uk');
    // tslint:disable-next-line
    // console.log(unmockedResult);
    // tslint:disable-next-line
    console.log(simulation.dataStoreService.get('test-store', 'donkey', 'k2'));
    // tslint:disable-next-line
    console.log(simulation.dataStoreService.get('test-store-2'));
}
