import { ServerResponse, OutgoingHttpHeaders } from "http"
import { createReadStream, statSync } from 'fs'
import * as path from 'path'

export class Asset {
    static asset: Asset

    constructor() {
        Asset.asset = this;
    }

    static getInstance(): Asset {
        return Asset.asset || new Asset();
    }

    getMime(ext) {
        const mime = {
            css: "text/css",
            gif: "image/gif",
            html: "text/html",
            ico: "image/x-icon",
            jpeg: "image/jpeg",
            jpg: "image/jpeg",
            js: "text/javascript",
            json: "application/json",
            pdf: "application/pdf",
            png: "image/png",
            svg: "image/svg+xml",
            swf: "application/x-shockwave-flash",
            tiff: "image/tiff",
            txt: "text/plain",
            wav: "audio/x-wav",
            wma: "audio/x-ms-wma",
            wmv: "video/x-ms-wmv",
            xml: "text/xml"
        };
        return mime[ext] || "text/plain";
    }
    contentType(uri) {
        const ext = uri.substr(uri.lastIndexOf('/') + 1).split('.')[1] || '';
        return this.getMime(ext);
    }
    exec(res: ServerResponse, uri: string, headers: OutgoingHttpHeaders) {
        uri = path.join(path.dirname(__dirname), '../app/', uri)
        try {
            const stat = statSync(uri);
            if (!stat.isFile()) {
                throw new Error("文件不存在")
            }
            headers['Content-Length'] = stat.size;
            headers['Last-Modified'] = new Date(stat.mtime).toUTCString();
            headers['Content-Type'] = this.contentType(uri);
            res.writeHead(200, headers);
            const stream = createReadStream(uri);
            stream.pipe(res);
            stream.on("end", () => stream.destroy())
            stream.on("error", () => {
                throw new Error("文件不存在")
            });
        } catch (e) {
            res.writeHead(404, headers);
            res.end("404 Not Found");
        }
    }
}