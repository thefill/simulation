import {ICronTickerPeriod} from './cron-ticker-period.interface';

export interface ICronTickerConfig extends ICronTickerPeriod {
    eventType: string;
    tickerCallback: (...args: any[]) => any;
    emitLimit?: number;
}
