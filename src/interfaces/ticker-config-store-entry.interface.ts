import {ICronTickerConfig} from './cron-ticker-config.interface';

export interface ITickerConfigStoreEntry extends ICronTickerConfig {
    startTime: number;
    nextEmitTime: number;
    previousEmitTime: number;
    stepTime: number;
    emitCount: number;
}
