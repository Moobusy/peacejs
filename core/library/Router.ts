import { colorConsole, Color } from "~core/util/console";
import { readdirSync, createReadStream, createWriteStream } from "fs";
import * as path from "path";
import { BaseController } from "~core/controller/BaseController";
import { ServerResponse, OutgoingHttpHeaders, IncomingMessage } from "http";
import { createGzip, createDeflate, Gzip } from "zlib";
import { Duplex, Readable, pipeline, Transform, PassThrough } from "stream";

interface ControllerMap extends NodeJS.Dict<typeof BaseController> {
}

interface TmpRoute {
    path: string
    actions: NodeJS.Dict<string>
}
interface TmpRouteMap extends NodeJS.Dict<TmpRoute> { }

interface Route {
    controller: typeof BaseController
    action: string
    redirect?: string
}
interface RouteMap extends NodeJS.Dict<Route> { }

export class Router {
    static router: Router
    controllerMap: ControllerMap = {}
    _tmpRouters: TmpRouteMap = {}
    routers: RouteMap = {}

    constructor() {
        Router.router = this;
        this.gatherRoutes()
        this.tidyRoutes()
    }

    static getInstance(): Router {
        return Router.router || new Router();
    }

    protected gatherRoutes() {
        // 引入controller
        const controllersDir = path.join(path.resolve(__dirname), "../../app/controller")
        readdirSync(controllersDir).filter(fileName => fileName.endsWith('.ts')).map(fileName => {
            this.controllerMap = {
                ...this.controllerMap,
                ...require(path.join(controllersDir, fileName))
            }
        });
        // 引入
        console.log(colorConsole(Color.redBG, `${Object.keys(this.controllerMap).length} controllers required!`));
    }
    protected tidyRoutes() {
        Object.keys(this._tmpRouters).forEach(controllerName => {
            const route = this._tmpRouters[controllerName];
            const controller = this.controllerMap[controllerName];
            const cPath = route.path === "" ? "/" : route.path
            Object.keys(route.actions).forEach(aPath => {
                const action = route.actions[aPath];
                if (aPath === "") {
                    this.routers[cPath] = {
                        controller,
                        action
                    }
                    if (cPath !== "/") {
                        this.routers[cPath + "/"] = {
                            controller,
                            action,
                            redirect: cPath
                        }
                    }
                } else {
                    const fPath = [cPath, aPath].join('/').replace(/\/\//, "/");
                    this.routers[fPath] = {
                        controller,
                        action
                    }
                }
            })
        })

        // console.log(this.routers)
    }
    async exec(req: IncomingMessage, res: ServerResponse, uri: string, headers: OutgoingHttpHeaders) {
        if (this.routers[uri]) {
            const route = this.routers[uri];
            const controller = new route['controller'](uri, req);
            let resp = await controller[route['action']].apply(controller);
            if (resp === null || resp === undefined) {
                resp = ""
            }

            if (typeof resp === "object") {
                resp = JSON.stringify(resp);
                headers['Content-Type'] = "application/json;charset=utf-8";
            } else {
                headers['Content-Type'] = "text/html; charset=utf-8";
            }
            const buffer = Buffer.from(resp, "utf-8")
            headers['Content-Length'] = buffer.length;

            // res.end(resp)

            let encoding = req.headers["accept-encoding"];
            if (typeof encoding === "object") {
                encoding = encoding[0]
            }

            const transForm = new PassThrough();
            transForm.end(buffer);
            if (encoding.match(/\bgzip\b/)) {
                headers['Content-Encoding'] = "gzip";
                delete headers['Content-Length'];
                res.writeHead(200, headers);
                transForm.pipe(createGzip()).pipe(res);
            } else if (encoding.match(/\bdeflate\b/)) {
                headers['Content-Encoding'] = "deflate";
                delete headers['Content-Length'];
                res.writeHead(200, headers);
                transForm.pipe(createDeflate()).pipe(res);
            } else {
                transForm.pipe(res);
            }
        }
    }
}