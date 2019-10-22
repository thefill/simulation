import {IInjection} from 'jetli';
import {ICronTickerConfig, ICronTickerPeriod, IServerConfig, ITickerConfigStoreEntry} from '../interfaces';
import {ICronConfig} from '../interfaces/cron-config.interface';
import {EventEmitter} from './even-emitter.class';

/**
 * Cron service that emits events at specific time
 */
export class CronService extends EventEmitter implements IInjection {
    public initialised = false;
    protected config: ICronConfig;
    protected heartbeat: NodeJS.Timer;
    protected tickerStore: { [tickerEventId: string]: ITickerConfigStoreEntry } = {};

    constructor(config?: ICronConfig) {
        super();
        this.applyConfig(config);
        this.setupTickers();
    }

    /**
     * Initialise cron service
     * @return {Promise<void>}
     */
    public async init(): Promise<void> {
        await this.startHeartbeat();
        this.initialised = true;
        // tslint:disable-next-line
        console.log('CronService: ready');
    }

    /**
     * Sets event tick
     * @param {ICronTickerConfig} tickConfig
     */
    public setTicker(tickConfig: ICronTickerConfig): void {
        const stepTime = this.configTimeToStepTime(tickConfig);
        const startTime = new Date().getTime();
        const emitCount = 0;
        const previousEmitTime = 0;
        let nextEmitTime = new Date().getTime();
        const configStoreEntry: ITickerConfigStoreEntry = {
            ...tickConfig, startTime, stepTime, nextEmitTime, emitCount, previousEmitTime
        };

        nextEmitTime = this.getNextEmitTime(configStoreEntry);
        configStoreEntry.nextEmitTime = nextEmitTime;

        // create new listener for the tick event
        if (tickConfig.tickerCallback) {
            this.on(tickConfig.tickerEventId, tickConfig.tickerCallback);
        }

        // create new ticker
        this.tickerStore[tickConfig.tickerEventId] = configStoreEntry;
    }

    /**
     * Set multiple tickers
     * @param {ICronTickerConfig[]} tickers
     */
    public setTickers(tickers: ICronTickerConfig[]) {
        for (const ticker of tickers) {
            this.setTicker(ticker);
        }
    }

    /**
     * Unset event tick
     * @param {string} tickerEventId
     */
    public unsetTicker(tickerEventId: string): void {
        const tickerStoreEntry = this.tickerStore[tickerEventId];

        if (tickerStoreEntry) {
            if (tickerStoreEntry.tickerCallback) {
                // remove listener for the tick event
                this.removeEventListener(tickerStoreEntry.tickerEventId, tickerStoreEntry.tickerCallback);
            }
            // remove ticker
            delete this.tickerStore[tickerEventId];
        }
    }

    /**
     * Get next emit time from config
     * @return {number}
     */
    protected getNextEmitTime(config: ITickerConfigStoreEntry): number {

        let nextTime = 0;
        // if step time defined use it to calculate next emit
        if (config.stepTime > 0) {
            nextTime = config.nextEmitTime + config.stepTime;
        } else {
            switch (config.period) {
                case 'M':
                    // for month
                    nextTime = new Date(
                        new Date(config.nextEmitTime).setMonth(new Date(config.nextEmitTime).getMonth() + 1)
                    ).getTime();
                    break;
                case 'y':
                    // for year
                    nextTime = new Date(
                        new Date(config.nextEmitTime).setFullYear(new Date(config.nextEmitTime).getFullYear() + 1)
                    ).getTime();
                    break;
                default:
                    throw new Error(`Invalid period ${config.periodCount! + config.period!}`);
            }
        }

        return nextTime;
    }

    /**
     * Convert config time to ms
     * @return {number}
     */
    protected configTimeToStepTime(periodConfig: ICronTickerPeriod): number {
        let periodCount = periodConfig.periodCount;
        let period = periodConfig.period;

        // if any invalid data reset to 1s
        if (!periodCount || !period) {
            periodCount = 1;
            period = 's';
        }

        // Calculate amount of ms in period
        let msMultipiler = 0;
        switch (period) {
            case 'ms':
                msMultipiler = 1;
                break;
            case 's':
                msMultipiler = 1000;
                break;
            case 'm':
                msMultipiler = 1000 * 60;
                break;
            case 'h':
                msMultipiler = 1000 * 100 * 60;
                break;
            case 'd':
                msMultipiler = 1000 * 100 * 60 * 24;
                break;
            case 'w':
                msMultipiler = 1000 * 100 * 60 * 24 * 7;
                break;
            case 'M':
            case 'y':
                // for year & month we cant calculate
                msMultipiler = 1;
                periodCount = -1;
                break;
            default:
                throw new Error(`Invalid period ${periodCount + period}`);
        }

        return msMultipiler * periodCount;
    }

    /**
     * Start heartbeat interval evaluation
     */
    protected startHeartbeat() {
        this.heartbeat = setInterval(this.heartbeatTickEvaluation.bind(this), this.config.heardbeatInterval!);
    }

    /**
     * Heartbeat interval evaluation
     */
    protected heartbeatTickEvaluation() {
        const currentTime = new Date().getTime();

        // evaluate each ticker config
        for (const [storeKey, tickerStoreEntry] of Object.entries(this.tickerStore)) {
            const tickerEventId = tickerStoreEntry.tickerEventId;
            const emitLimit = tickerStoreEntry.emitLimit;
            const emitCount = tickerStoreEntry.emitCount;
            const emitTime = tickerStoreEntry.nextEmitTime;
            const previousEmitTime = tickerStoreEntry.previousEmitTime;

            // check if we should emit event now, be sure we dont emit multiple times for same nextEmitTime
            // lets take into consideration events between previous tick and now (e.g. if step is uneven)
            if (emitTime >= currentTime - this.config.heardbeatInterval! + 1 &&
                emitTime <= currentTime && emitTime !== previousEmitTime) {

                // if emit limit set and on or above limit
                if (emitLimit && emitCount >= emitLimit) {
                    // remove ticker and bailout
                    this.unsetTicker(tickerEventId);
                    continue;
                }

                // emit ticker event
                this.emit(tickerStoreEntry.tickerEventId);

                // update record
                const tickerStoreEntryUpdates = {
                    // preserve current emit time
                    previousEmitTime: emitTime,
                    // calculate next time for emitting event
                    nextEmitTime: this.getNextEmitTime(tickerStoreEntry),
                    // record emittion count
                    emitCount: emitCount + 1
                };
                this.tickerStore[storeKey] = {...tickerStoreEntry, ...tickerStoreEntryUpdates};
            }
        }
    }

    /**
     * Setup tickers from config
     */
    protected setupTickers() {
        if (this.config.tickers) {
            this.setTickers(this.config.tickers);
        }
    }

    /**
     * Apply config
     * @param {IServerConfig} config
     */
    protected applyConfig(config?: ICronConfig) {
        this.config = {
            heardbeatInterval: 1000, // every 1s
            tickers: []
        };

        if (config) {
            Object.assign(this.config, config);
        }

        // if any ticker interval lower than heartbeat interval throw error
        for (const ticker of this.config.tickers!) {
            const stepTime = this.configTimeToStepTime(ticker);
            if (stepTime <= this.config.heardbeatInterval!) {
                throw new Error(
                    `Ticker evolution of ${stepTime}ms is shorter than 
                    cron interval (${this.config.heardbeatInterval}ms)`
                );
            }
        }
    }
}
