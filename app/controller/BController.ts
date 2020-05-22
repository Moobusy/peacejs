import { BaseController } from "~core/controller/BaseController"
import { router, routerPrefix } from "~core/decorator/router"

@routerPrefix("/dd")
export class BController extends BaseController {
    @router("")
    async index() {
        return "asdf";
    }

    @router('test')
    async test(){
        return 'tesst';
    }
}