import {HttpMethod} from '../enums';

export type ServerRequestCallback = (
    method: HttpMethod,
    url: string,
    headers: any,
    params: any,
    payload?: any
) => Promise<{
    statusCode: number;
    message: any;
}>;
