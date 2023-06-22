import { Request, Response, Server } from 'hyper-express';
import cors = require('cors');
import {
  ErrorHandler,
  NestApplicationOptions,
  RequestHandler,
  VersioningOptions,
  VersionValue,
} from '@nestjs/common/interfaces';
import { RequestMethod } from '@nestjs/common';
import { HyperExpressMiddlewareService } from './hyper-express-middleware.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AbstractHttpAdapter } from '@nestjs/core';
import {
  CorsOptions,
  CorsOptionsDelegate,
} from '@nestjs/common/interfaces/external/cors-options.interface';
import { MiddlewareHandler } from 'hyper-express/types/components/middleware/MiddlewareHandler';
import { createReadStream } from 'fs';
import path from 'path';
import { stat } from 'fs/promises';

export class HyperExpressAdapter extends AbstractHttpAdapter {
  readonly server: Server;
  readonly middlewareService = new HyperExpressMiddlewareService();
  readonly httpServerEvent = new EventEmitter2({
    wildcard: true, // if the event emitter should use wildcards.
    delimiter: '::', // the delimiter used to segment namespaces, defaults to ..
    newListener: false, // if you want to emit the newListener event set to true.
    maxListeners: 20, // the max number of listeners that can be assigned to an event, defaults to 10.
  });
  listeningHost = '';
  constructor(instance?: Server) {
    instance ??= new Server();
    super(instance);
    this.server = instance;
    this.jsonParser();

    // temporary: to check how is this property used by nestjs
    this.httpServerEvent.on('*', (event) => {
      console.info('got event', event);
    });
    Object.defineProperty(this.httpServerEvent, 'address', {
      value: (): string => this.listeningHost,
      enumerable: false,
    });
    this.all('/debug/*', (req: Request, res: Response): void => {
      console.log('got request:', req.method, req.url);
      res.json('done');
    });
  }

  get(...args: any[]): any {
    const { path, handler } = this.getPathHandler(args);
    const middlewares = this.middlewareService.get(path);
    // console.log(':: tracking: get', path);
    this.server.get(path, middlewares, handler);
  }
  post(...args: any[]): any {
    const { path, handler } = this.getPathHandler(args);
    const middlewares = this.middlewareService.post(path);
    // console.log(':: tracking: post', path);
    this.server.post(path, middlewares, handler);
  }
  head(...args: any[]): any {
    const { path, handler } = this.getPathHandler(args);
    const middlewares = this.middlewareService.head(path);
    // console.log(':: tracking: head', path);
    this.server.head(path, middlewares, handler);
  }
  delete(...args: any[]): any {
    const { path, handler } = this.getPathHandler(args);
    const middlewares = this.middlewareService.delete(path);
    // console.log(':: tracking: delete', path);
    this.server.delete(path, middlewares, handler);
  }
  put(...args: any[]): any {
    const { path, handler } = this.getPathHandler(args);
    const middlewares = this.middlewareService.put(path);
    // console.log(':: tracking: put', path);
    this.server.put(path, middlewares, handler);
  }
  patch(...args: any[]): any {
    const { path, handler } = this.getPathHandler(args);
    const middlewares = this.middlewareService.patch(path);
    // console.log(':: tracking: patch', path);
    this.server.patch(path, middlewares, handler);
  }
  all(...args: any[]): any {
    const { path, handler } = this.getPathHandler(args);
    const middlewares = this.middlewareService.all(path);
    // console.log(':: tracking: all', path);
    this.server.all(path, middlewares, handler);
  }
  options(...args: any[]): any {
    const { path, handler } = this.getPathHandler(args);
    const middlewares = this.middlewareService.options(path);
    // console.log(':: tracking: options', path);
    this.server.options(path, middlewares, handler);
  }

  getPathHandler(args: any[]): { path: string; handler: RequestHandler } {
    const path = args.find((e) => typeof e === 'string');
    const handler = args.find((e) => typeof e === 'function');

    return { path, handler };
  }

  // for middlewares, prevent registering it as a route
  createMiddlewareFactory(
    requestMethod: RequestMethod,
  ): (path: string, callback: any) => any {
    return this.middlewareService.factory(requestMethod);
  }

  jsonParser(): void {
    this.server.use((req, _, next) => {
      const contentType = req.header('content-type');
      if (!contentType || !contentType.includes('json')) {
        return next();
      }

      req
        .json()
        .then((json) => {
          req.body = json;
          next();
        })
        .catch((err) => {
          if (err instanceof SyntaxError) {
            const error = new Error('json body is malformed', { cause: err });
            return next(error);
          }
          return next(err);
        });
    });
  }

  getHttpServer(): any {
    return this.httpServerEvent;
  }

  initHttpServer(options: NestApplicationOptions): EventEmitter2 {
    return this.httpServerEvent;
  }

  async close(): Promise<unknown> {
    this.server.close();
    return;
  }

  listen(port: string | number, ...args: any[]): any {
    const host = args.find((e: any) => typeof e === 'string') ?? '127.0.0.1';
    const callback = (e?: any): void => {
      if (typeof e === 'string') {
        e = new Error(e);
      }
      const cb =
        args.find((e) => typeof e === 'function') ??
        ((_?: any): void => void 0);
      if (e instanceof Error) {
        cb(e);
        return;
      }
      this.listeningHost = host;
      cb();
    };
    this.server.listen(+port, host).then(callback).catch(callback);
    return this.httpServerEvent as any;
  }

  setNotFoundHandler(handler: RequestHandler): any {
    return this.server.set_not_found_handler(handler);
  }

  setErrorHandler(handler: ErrorHandler): any {
    return this.server.set_error_handler((request, response, error) => {
      handler(error, request, response);
    });
  }

  applyVersionFilter(
    handler: RequestHandler,
    version: VersionValue,
    versioningOptions: VersioningOptions,
  ): (req: any, res: any, next: () => void) => any {
    throw new Error(
      `not yet implemented: apply version filter ` +
      `(${handler.name} ` +
      `${String(version)} ` +
      `${JSON.stringify(versioningOptions)})`,
    );
  }

  enableCors(options: CorsOptions | CorsOptionsDelegate<any>): any {
    this.use(cors(options));
  }

  end(response: Response, message?: string): any {
    if (message) {
      response.send(message, true);
    } else {
      response.end();
    }
  }

  getRequestHostname(request: Request): string {
    return request.hostname;
  }

  getRequestMethod(request: Request): string {
    return request.method;
  }

  getRequestUrl(request: Request): string {
    return request.url;
  }

  getType(): string {
    return 'hyper-express';
  }

  isHeadersSent(response: Response): boolean {
    return response.headersSent;
  }

  redirect(response: Response, statusCode: number, url: string): any {
    return response.status(statusCode).redirect(url);
  }

  registerParserMiddleware(
    prefix: string | undefined,
    rawBody: boolean | undefined,
  ): any {
    console.info('[hyper express] not yet implemented', {
      prefix,
      rawBody,
    });
    return;
  }

  render(response: Response, view: string, options: any): any {
    throw new Error('not yet implemented: render');
  }

  reply(
    response: Response & { propagateStatusCode?: number },
    body: any,
    statusCode?: number,
  ): any {
    statusCode ??= response.propagateStatusCode ?? 200;
    response.status(statusCode).json(body);
  }

  setHeader(response: Response, name: string, value: string): any {
    response.header(name, value);
  }

  setViewEngine(engine: string): any {
    throw new Error('not yet implemented: engine');
  }

  status(response: Response, statusCode: number): any {
    Object.assign(response, { propagateStatusCode: statusCode });
    return response.status(statusCode);
  }

  serveStaticMiddleware(distPath: string, options: any): MiddlewareHandler {
    const middleware = serveStatic(distPath, options);
    return async (request, response, next) => {
      try {
        await new Promise<void>((resolve, reject) => {
          middleware(request as any, response as any, (e?: any): void => {
            if (e) {
              reject(e);
            } else {
              resolve();
            }
          });
        });
      } catch (error) {
        return error;
      }
    };
  }

  wrapHandler(handler: RequestHandler): (req: Request, res: Response) => void {
    return (req, res) => {
      handler(req, res, (e?: any) => {
        if (e && !res.writableFinished) {
          res.status(404).end();
        }
      });
    };
  }
  useStaticAssets(distPath: string, options: { prefix: string }): any {
    const pathname = `${options.prefix ?? '/'}`;
    const middleware: MiddlewareHandler = async (request, response) => {
      try {
        const filePath = request.url.substring(pathname.length);
        const fullFilePath = path.join(distPath, filePath);
        const fileStatus = await stat(fullFilePath);
        if (fileStatus.isDirectory()) {
          response.sendStatus(404).end();
          return;
        }
        const contentType = mimeType.contentType(filePath) || 'text/plain';
        const readStream = createReadStream(fullFilePath);
        readStream.on('error', (error) => {
          console.log(error);
          response.sendStatus(404).end();
        });
        response.setHeader('content-type', contentType).stream(readStream);
      } catch (error) {
        response.sendStatus(404).end();
      }
    };
    this.all(pathname, this.wrapHandler(serveStatic(distPath)));
    this.all(path.join(pathname, '*'), this.wrapHandler(serveStatic(distPath)));
  }
}
