import DB from "./db";
import LOGGER from "./logger";
import URL from "url";

const db = new DB();
const log = new LOGGER();

class API {
  _formatURL(request: any) {
    return URL.format({
      protocol: request.protocol,
      host: request.get("host"),
      pathname: request.originalUrl,
    });
  }

  _getNextURL(request: any, page: number) {
    return URL.format({
      protocol: request.protocol,
      host: request.get("host"),
      pathname: request.originalUrl,
      query: {
        page: page + 1,
      },
    });
  }

  _getPrevURL(request: any, page: number) {
    return URL.format({
      protocol: request.protocol,
      host: request.get("host"),
      pathname: request.originalUrl,
      query: {
        page: page - 1,
      },
    });
  }

  _validate(request: any) {
    return {
      success: true,
    };
  }

  browse(request: any) {
    const validation: any = this._validate(request);
    if (!validation.success) return validation.reponse;

    const queryOptions = {
      page: 0,
      filter: {},
      sort: {
        key: "id",
        order: "asc",
      },
    };

    if (request.query.filter) {
      if (request.query.filter.indexOf(":") > -1) {
        const filterParams = request.query.filter.split(":");
        const filterKey = filterParams[0];
        const filterValue = filterParams[1];
        queryOptions.filter = {
          key: filterKey,
          value: filterValue,
        };
      }
    }

    if (request.query.page) queryOptions.page = request.query.page;
    if (request.query.sort) {
      if (request.query.sort.indexOf(":")) {
        const sortParams = request.query.sort.split(":");
        const sortKey = sortParams[0];
        const sortOrder = sortParams[1];
        queryOptions.sort = {
          key: sortKey,
          order: sortOrder,
        };
      }
    }

    const { results, next, prev } = db.read(queryOptions);

    const response = {
      _prev: prev ? this._getPrevURL(request, queryOptions.page) : false,
      _next: next ? this._getNextURL(request, queryOptions.page) : false,
      _self: this._formatURL(request),
      _count: results.length,
      results,
      success: true,
    };

    return response;
  }

  read(request: any) {
    const validation: any = this._validate(request);
    if (!validation.success) return validation.reponse;

    const { results, next, prev } = db.read({
      page: 0,
      filter: {
        key: "id",
        value: parseInt(request.params.id, 10),
      },
      sort: {
        key: "id",
        order: "asc",
      },
    });

    const response = {
      _self: this._formatURL(request),
      _count: results.length,
      results,
      success: true,
    };

    return response;
  }

  add(request: any) {
    log.write("add");

    const insert = {
      name: request.body.name,
      surname: request.body.surname,
      address: request.body.address,
      phone: request.body.phone,
      email: request.body.email,
      date: request.body.date,
    };

    const { result } = db.write(insert);

    return {
      result,
      success: true,
    };
  }
}

export default API;
