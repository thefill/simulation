import {IInjection} from 'jetli';
import {EventEmitter} from './even-emitter.class';

/**
 * Cron service that emits events at specific time
 */
export class EventCronService extends EventEmitter implements IInjection {
    public initialised = false;

    /**
     * Initialise cron service
     * @return {Promise<void>}
     */
    public async init(): Promise<void> {
        this.initialised = true;
        // tslint:disable-next-line
        console.log('CronService: ready');
    }

    /**
     * Sets event tick
     * @param {number} periodCount
     * @param {"d" | "h" | "m" | "s" | "ms"} period
     * @param {string} eventType
     * @param {number} executionLimit
     */
    public set(
        eventType: string,
        periodCount: number,
        period: 'd' | 'h' | 'm' | 's' | 'ms' = 's',
        executionLimit: number = -1
    ): void {
    }

    /**
     * Unset event tick
     * @param {string} eventType
     */
    public unset(eventType: string): void {
    }
}
