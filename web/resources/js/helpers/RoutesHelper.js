class RoutesHelper {
    constructor() {
        this.routes = window.routes;
    }

    get routes() {
        return this._routes;
    }

    set routes(routes) {
        this._routes = routes;
    }


    getRoute(name, param, replace) {
        let route = this.getRouteIfExistsOrThrowException(name);

        if (!param)
            return route;

        if (param && !replace) {
            throw new Error('To get a dynamic route you must provide replace text');
        }

        return route.replace(replace, param);
    }

    getRouteIfExistsOrThrowException(name) {
        const r = this.routes[name];
        if ('undefined' == typeof r)
            throw new Error('This route does not exists');

        return r;
    }

}

export default RoutesHelper;