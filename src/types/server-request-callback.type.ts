export type ServerRequestCallback = (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    headers?: any,
    payload?: any
) => Promise<{
    statusCode: number;
    message: any;
}>;
