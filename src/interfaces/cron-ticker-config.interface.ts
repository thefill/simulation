import {ICronTickerPeriod} from './cron-ticker-period.interface';

export interface ICronTickerConfig extends ICronTickerPeriod {
    // id you can identify ticker against (e.g. when doing cronService.on(...) or deleting ticker)
    tickerEventId: string;
    // ticker callback
    tickerCallback?: (...args: any[]) => any;
    emitLimit?: number;
}
