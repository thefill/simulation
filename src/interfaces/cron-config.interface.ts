import {ICronTickerConfig} from './cron-ticker-config.interface';

export interface ICronConfig {
    // evolution length of single tick
    heardbeatInterval?: number;
    // cron ticker events
    tickers?: ICronTickerConfig[];
}
