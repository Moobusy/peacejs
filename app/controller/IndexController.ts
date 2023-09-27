import { BaseController } from "~core/controller/BaseController"
import { router, routerPrefix } from "~core/decorator/router"

@routerPrefix("/")
export class IndexController extends BaseController {
    @router("")
    async index() {
        return {
            "name": "tstest",
            "version": "1.0.0",
            "lockfileVersion": 1,
            "requires": true,
            "dependencies": {
                "@types/json5": {
                    "version": "0.0.29",
                    "resolved": "https://registry.npmjs.org/@types/json5/-/json5-0.0.29.tgz",
                    "integrity": "sha1-7ihweulOEdK4J7y+UnC86n8+ce4="
                },
                "@types/node": {
                    "version": "14.0.1"
                },
                "json5": {
                    "version": "1.0.1",
                    "resolved": "https://registry.npmjs.org/json5/-/json5-1.0.1.tgz",
                    "integrity": "sha512-aKS4WQjPenRxiQsC93MNfjx+nbF4PAdYzmd/1JIj8HYzqfbu86beTuNgXDzPknWk0n0uARlyewZo4s++ES36Ow==",
                    "requires": {
                        "minimist": "^1.2.0"
                    }
                },
                "minimist": {
                    "version": "1.2.5",
                    "resolved": "https://registry.npmjs.org/minimist/-/minimist-1.2.5.tgz",
                    "integrity": "sha512-FM9nNUYrRBAELZQT3xeZQ7fmMOBg6nWNmJKTcgsJeaLstP/UODVpGsr5OhXhhXg6f+qtJ8uiZ+PUxkDWcgIXLw=="
                },
                "strip-bom": {
                    "version": "3.0.0",
                    "resolved": "https://registry.npmjs.org/strip-bom/-/strip-bom-3.0.0.tgz",
                    "integrity": "sha1-IzTBjpx1n3vdVv3vfprj1YjmjtM="
                },
                "tsconfig-paths": {
                    "version": "3.9.0",
                    "resolved": "https://registry.npmjs.org/tsconfig-paths/-/tsconfig-paths-3.9.0.tgz",
                    "integrity": "sha512-dRcuzokWhajtZWkQsDVKbWyY+jgcLC5sqJhg2PSgf4ZkH2aHPvaOY8YWGhmjb68b5qqTfasSsDO9k7RUiEmZAw==",
                    "requires": {
                        "@types/json5": "^0.0.29",
                        "json5": "^1.0.1",
                        "minimist": "^1.2.0",
                        "strip-bom": "^3.0.0"
                    }
                }
            }
        }


    }

    @router('test')
    async test() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('test')
            }, 3000)
        })
    }
}