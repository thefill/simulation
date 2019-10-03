export type ProxyOverwriteCallback = (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    headers?: any,
    payload?: any
) => Promise<any>;
