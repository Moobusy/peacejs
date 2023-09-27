import { colorConsole, Color } from "~core/util/console";
import { readdirSync, createReadStream, createWriteStream } from "fs";
import * as path from "path";
import { BaseController } from "~core/controller/BaseController";
import { ServerResponse, OutgoingHttpHeaders, IncomingMessage } from "http";
import { createGzip, createDeflate } from "zlib";
import { PassThrough } from "stream";

type ControllerMap = {
    [key: string]: typeof BaseController
}
type TmpRoute = {
    path: string
    actions: NodeJS.Dict<string>
}
type TmpRouteMap = {
    [key: string]: TmpRoute
}

type Route = {
    controller: typeof BaseController
    action: string
    redirect?: string
}
type RouteMap = {
    [key: string]: Route
}
export class Router {
    static router: InstanceType<typeof Router>
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
        if (this.routers.hasOwnProperty(uri)) {
            const route = this.routers[uri];
            const controller = new route['controller'](uri, req);
            let response = await controller[route['action']].apply(controller);
            this.writeResponse(response, req, res, headers);
        } else {
            this.writeResponse("", req, res, headers, 404);
        }
    }

    writeResponse(response: String | null | Object, req: IncomingMessage, res: ServerResponse, headers: OutgoingHttpHeaders, status: number = 200) {
        let resp = "";
        if (typeof response === "object") {
            resp = JSON.stringify(response);
            headers['Content-Type'] = "application/json;charset=utf-8";
        } else {
            resp = response || "";
            headers['Content-Type'] = "text/html; charset=utf-8";
        }
        const buffer = Buffer.from(resp, "utf-8")
        headers['Content-Length'] = buffer.length;

        let encoding = req.headers["accept-encoding"];
        if (typeof encoding === "object") {
            encoding = encoding[0]
        }

        const transForm = new PassThrough();
        transForm.end(buffer);
        if (encoding.includes("gzip") && buffer.length > 512) {
            headers['Content-Encoding'] = "gzip";
            delete headers['Content-Length'];
            res.writeHead(status, headers);
            transForm.pipe(createGzip({
                level: 3
            })).pipe(res);
        } else if (encoding.includes("deflate") && buffer.length > 512) {
            headers['Content-Encoding'] = "deflate";
            delete headers['Content-Length'];
            res.writeHead(status, headers);
            transForm.pipe(createDeflate({
                level: 3
            })).pipe(res);
        } else {
            res.writeHead(status, headers);
            transForm.pipe(res);
        }
    }
}