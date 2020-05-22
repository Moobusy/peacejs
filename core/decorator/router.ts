import { App } from "../interface/App"
import { Router } from "~core/library/Router";

// export function disable() {
//     return function (target, propertyKey: string, descriptor: PropertyDescriptor): any {
//         let method: Function = descriptor.value;
//         descriptor.value = function () {
//             const app: App = this.app;
//             if (app.auth.nodes.indexOf("admin") > -1) {
//                 method.apply(this, arguments);
//             } else {
//                 throw new Error("没权限");
//             }
//         }
//     }
// }

export function router(path: string, middleWares: string[] = []) {
    // console.log(this)
    // console.log('██ [router]', this);
    // this.routes[propertyKey] = {
    //     path,
    //     middlewares
    // }
    // return function <T extends BaseController>(target: T, propertyKey: string, descriptor: PropertyDescriptor): any {
    return function (target, methodName: string, descriptor: PropertyDescriptor): any {

        // 类名 target.constructor.name
        // 方法名 methodName
        // 路由 path
        // 中间件 middleWares

        // console.log("+++++++++++++++++++++++++方法++++++++++++++++++++++++++++")
        // console.log("类名", target.constructor.name);
        // console.log("方法名", methodName);
        // console.log("路由", path);
        // console.log("中间件", middleWares);

        // console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++")
        // // console.log('██ [router]', Object.keys(target));
        // // console.log('██ [router]', typeof target);

        // // console.log(target.aaa)
        // // console.log(target)
        // // console.log(target.constructor.name)
        // // console.log(target.constructor)
        // // console.log(target.prototype)
        // // console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++")

        const router = Router.getInstance()
        if (!router._tmpRouters[target.constructor.name]) {
            router._tmpRouters[target.constructor.name] = {
                path: '',
                actions: {}
            }
        }

        router._tmpRouters[target.constructor.name].actions[path.trim()] = methodName;
        let method: Function = descriptor.value;
        descriptor.value = async function () {
            const app: App = this.app;
            return await method.apply(this, arguments);
        }
    }
}

export function routerPrefix(path: string, middleWares: string[] = []) {
    return function (target) {
        // console.log("+++++++++++++++++++++++++类++++++++++++++++++++++++++++")
        // console.log("类名", target.name)
        // console.log("路由", path)
        // console.log("中间件", middleWares)
        // console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++")
        const router = Router.getInstance()
        Object.keys(router._tmpRouters).forEach(controllerName => {
            if (controllerName !== target.name) {
                return;
            }
            router._tmpRouters[controllerName].path = path.trim();
        })

        // console.log("██ [routerPrefix]", target, path, middleWares, target['$mate'])
        // target._routeGroup = path;
        // target._middleWares = middlewares;
    }
}