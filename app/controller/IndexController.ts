import { BaseController } from "~core/controller/BaseController"
import { router, routerPrefix } from "~core/decorator/router"

@routerPrefix("/")
export class IndexController extends BaseController {
    @router("")
    async index() {
        return "首页"
    }

    @router('test')
    async test() {
        return { "succeed": "true", "errorCode": 200, "message": "" };
    }
}