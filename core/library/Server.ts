import { createServer, ServerResponse, IncomingMessage, Server as HttpServer } from "http";
import { colorConsole, Color } from '../util/console'
import { Asset } from "./Asset"
import { Router } from "./Router";

export class Server {
    static instance: InstanceType<typeof Server>
    server: HttpServer
    port: number
    hostname: string
    router: Router

    static start() {
        if (!Server.instance) {
            Server.instance = new Server();
        }
        Server.instance.doListen();
    }

    constructor(port = 5568, hostname = "0.0.0.0") {
        this.port = port;
        this.hostname = hostname;
        this.router = Router.getInstance();
    }

    generateHeaders() {
        return {
            Date: new Date().toUTCString()
        }
    }
    getClientIP(req: IncomingMessage) {
        return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
            req.connection.remoteAddress || // 判断 connection 的远程 IP
            req.socket.remoteAddress || // 判断后端的 socket 的 IP
            req.connection.remoteAddress;
    };

    getParamsFromArgs(): { [key: string]: string } {
        let params: { [key: string]: string } = {};
        let args = process.argv.slice(2);
        args.forEach(arg => {
            let [key, value] = arg.split('=');
            params[key] = value;
        })
        return params
    }
    protected doListen() {
        let params = this.getParamsFromArgs();
        if (params.hasOwnProperty('port')) {
            this.port = parseInt(params.port);
        }
        if (params.hasOwnProperty('hostname')) {
            this.hostname = params.hostname;
        }

        this.server = createServer((req: IncomingMessage, res: ServerResponse) => this.onRequest(req, res))
        this.server.listen(this.port, this.hostname, () => {
            let hostname = this.hostname === '0.0.0.0' ? '127.0.0.1' : this.hostname
            let url = `http://${hostname}:${this.port}`;
            let output = `██   server is running on ${colorConsole(Color.red, url)}   ██`;
            console.log('')
            console.log(Array.from(new Array(`server is running on ${url}`.length + 10)).map(() => "█").join(''))
            console.log('██' + Array.from(new Array(`server is running on ${url}`.length + 6)).map(() => " ").join('') + '██')
            console.log(output)
            console.log('██' + Array.from(new Array(`server is running on ${url}`.length + 6)).map(() => " ").join('') + '██')
            console.log(Array.from(new Array(`server is running on ${url}`.length + 10)).map(() => "█").join(''))
            console.log('')
        })
    }

    onRequest(req: IncomingMessage, res: ServerResponse) {
        let uri = req.url.indexOf('?') > -1 ? req.url.substr(0, req.url.indexOf('?')) : req.url;
        let headers = this.generateHeaders();
        let startDate = new Date();
        let startTime = startDate.getTime()
        if (uri.startsWith('/assets/') || uri.startsWith('/favicon.ico')) {
            Asset.getInstance().exec(res, uri, headers);
        } else {
            Router.getInstance().exec(req, res, uri, headers);
        }
        res.on("finish", () => {
            console.log([
                `[${startDate.toUTCString()}]`,
                uri,
                `${new Date().getTime() - startTime}ms`,
                this.getClientIP(req),
                req.headers["user-agent"],
                req.headers.referer || "No Referer"
            ].join("\t"))
        })
    }
}