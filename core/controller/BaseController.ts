import { App, Auth } from "../interface/App"
import { IncomingMessage } from "http";

export class Context {
    ctx: App
    req: IncomingMessage
    uri: string
    params: URLSearchParams
    constructor(uri, req) {
        this.uri = uri;
        this.req = req;
        this.params = new URLSearchParams(this.uri === this.req.url ? '' : this.req.url.substring(this.uri.length + 1));
    }
}

export class BaseController extends Context {
    getService<T extends Context>(name: new () => T): T {
        return new name();
    }
}