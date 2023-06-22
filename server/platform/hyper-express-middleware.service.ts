import { RequestMethod } from '@nestjs/common';
import { RequestHandler } from '@nestjs/common/interfaces';
import { MiddlewareHandler } from 'hyper-express';
import { match as pathMatching } from 'node-match-path';

type Path = string;

export class HyperExpressMiddlewareService {
  middlewareStack = new Array<{
    method: RequestMethod;
    pathPattern: Path;
    callback: MiddlewareHandler;
  }>();

  factory(
    method: RequestMethod,
  ): (path: string, callback: RequestHandler) => any {
    return (path, callback) => {
      this.middlewareStack.push({
        method,
        pathPattern: path,
        callback: this.wrapHandler(callback),
      });
    };
  }

  get(path: Path): MiddlewareHandler[] {
    return this.middlewareStack
      .filter((e) => {
        return e.method === RequestMethod.GET || e.method === RequestMethod.ALL;
      })
      .filter((e) => pathMatching(e.pathPattern, path)?.matches)
      .map((e) => e.callback);
  }

  post(path: Path): MiddlewareHandler[] {
    return this.middlewareStack
      .filter((e) => {
        return (
          e.method === RequestMethod.POST || e.method === RequestMethod.ALL
        );
      })
      .filter((e) => pathMatching(e.pathPattern, path)?.matches)
      .map((e) => e.callback);
  }

  head(path: Path): MiddlewareHandler[] {
    return this.middlewareStack
      .filter((e) => {
        return (
          e.method === RequestMethod.HEAD || e.method === RequestMethod.ALL
        );
      })
      .filter((e) => pathMatching(e.pathPattern, path)?.matches)
      .map((e) => e.callback);
  }

  delete(path: Path): MiddlewareHandler[] {
    return this.middlewareStack
      .filter((e) => {
        return (
          e.method === RequestMethod.DELETE || e.method === RequestMethod.ALL
        );
      })
      .filter((e) => pathMatching(e.pathPattern, path)?.matches)
      .map((e) => e.callback);
  }

  put(path: Path): MiddlewareHandler[] {
    return this.middlewareStack
      .filter((e) => {
        return e.method === RequestMethod.PUT || e.method === RequestMethod.ALL;
      })
      .filter((e) => pathMatching(e.pathPattern, path)?.matches)
      .map((e) => e.callback);
  }

  patch(path: Path): MiddlewareHandler[] {
    return this.middlewareStack
      .filter((e) => {
        return (
          e.method === RequestMethod.PATCH || e.method === RequestMethod.ALL
        );
      })
      .filter((e) => pathMatching(e.pathPattern, path)?.matches)
      .map((e) => e.callback);
  }

  all(path: Path): MiddlewareHandler[] {
    return this.middlewareStack
      .filter((e) => {
        return e.method === RequestMethod.ALL;
      })
      .filter((e) => pathMatching(e.pathPattern, path)?.matches)
      .map((e) => e.callback);
  }

  options(path: Path): MiddlewareHandler[] {
    return this.middlewareStack
      .filter((e) => {
        return (
          e.method === RequestMethod.OPTIONS || e.method === RequestMethod.ALL
        );
      })
      .filter((e) => pathMatching(e.pathPattern, path)?.matches)
      .map((e) => e.callback);
  }

  wrapHandler(handler: RequestHandler): MiddlewareHandler {
    return async (req, res, next) => {
      try {
        await new Promise<void>((res, rej) => {
          handler(req, res, (error) => (error ? rej(error) : res()));
        });
      } catch (error) {
        next(error);
      }
    };
  }
}
