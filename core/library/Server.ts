import { createServer, ServerResponse, IncomingMessage, Server as HttpServer } from "http";
import { colorConsole, Color } from '../util/console'
import { Asset } from "./Asset"
import { Router } from "./Router";

// // 引入所有controller


// // 创建服务
// // 收集路由
// // 监听端口


// const server = http.createServer((req, res) => {
//     res.end("hello world");
// });

// server.listen(5568, "127.0.0.1", () => {
//     console.log("server is running on ", 5568, "127.0.0.1")
// });

export class Server {
    port: number
    hostname: string
    server: HttpServer
    router: Router

    constructor(port, hostname = "0.0.0.0") {
        this.port = port;
        this.hostname = hostname;
        this.router = Router.getInstance();
        this.server = createServer((req: IncomingMessage, res: ServerResponse) => {
            this.onRequest(req, res)
        });
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

    start() {
        this.doListen();
    }

    protected doListen() {
        this.server.listen(this.port, this.hostname, () => {
            const hostname = this.hostname === '0.0.0.0' ? '127.0.0.1' : this.hostname
            const url = `http://${hostname}:${this.port}`;
            const output = `██   server is running on ${colorConsole(Color.red, url)}   ██`;
            console.log('')
            console.log(Array.from(new Array(`server is running on ${url}`.length + 10)).map(() => "█").join(''))
            console.log('██' + Array.from(new Array(`server is running on ${url}`.length + 6)).map(() => " ").join('') + '██')
            console.log(output)
            console.log('██' + Array.from(new Array(`server is running on ${url}`.length + 6)).map(() => " ").join('') + '██')
            console.log(Array.from(new Array(`server is running on ${url}`.length + 10)).map(() => "█").join(''))
            console.log('')
        });
    }

    onRequest(req: IncomingMessage, res: ServerResponse) {
        const uri = req.url.indexOf('?') > -1 ? req.url.substr(0, req.url.indexOf('?')) : req.url;
        const headers = this.generateHeaders();
        const startTime = new Date().getTime()
        if (uri.startsWith('/assets/')) {
            Asset.getInstance().exec(res, uri, headers);
        } else {
            Router.getInstance().exec(req, res, uri, headers);
        }
        res.on("finish", () => {
            console.log([
                `[${new Date().toUTCString()}]`,
                colorConsole(Color.red, uri),
                `${new Date().getTime() - startTime}ms`,
                this.getClientIP(req),
                req.headers["user-agent"],
                req.headers.referer || "No Referer"
            ].join(" █ "))
        })
    }
}