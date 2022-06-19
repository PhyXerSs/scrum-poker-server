import { Injectable, NestMiddleware } from '@nestjs/common';
import * as path from 'path';
import { ROUTE_FRONT, ROUTE_BACK } from '../routes';

const allowedExt = [
  '.js',
  '.ts',
  '.tsx',
  '.ico',
  '.css',
  '.png',
  '.jpg',
  '.gif',
  '.woff2',
  '.woff',
  '.ttf',
  '.svg',
];

const resolvePath = (file: string): string => path.resolve(`./connectx-app/build/${file}`);

@Injectable()
export class FrontendMiddleware implements NestMiddleware {
  use(req, res, next): void {
    res.header(
      'Access-Control-Allow-Headers',
      'access-control-allow-origin, X-Requested-With, Accept, Origin, content-type, authorization',
    );
    res.header('Access-Control-Allow-Methods', 'POST,PUT,GET,DELETE');
    res.header('Access-Control-Allow-Origin', '*');
    res.removeHeader('x-powered-by');
    res.removeHeader('server');

    const { url } = req;

    // if (url.indexOf(ROUTE_FRONT) === 1 || url.indexOf(ROUTE_BACK) === 0) {
    //   next();
    // } else if (allowedExt.filter(ext => url.indexOf(ext) > 0).length > 0) {
    //   res.sendFile(resolvePath(url));
    // } else {
    //   res.sendFile(resolvePath('index.html'));
    // }
    if (allowedExt.filter(ext => url.indexOf(ext) > 0).length > 0) {
      const fileExt = allowedExt.find(ext => url.indexOf(ext) > 0);
      const fileName = url.replace(ROUTE_BACK, '').split(fileExt)[0] + fileExt;

      res.sendFile(resolvePath(fileName));
    } else if (url.indexOf(ROUTE_FRONT) === 1 || url.indexOf(ROUTE_BACK) === 0) {
      next();
    } else {
      res.sendFile(resolvePath('index.html'));
    }
  }
}
