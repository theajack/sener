import fs from 'fs';
import events from 'events';
import http from 'http';
import url from 'url';
import path from 'path';
import MIME from 'mime';
import { mstat } from './util';
import { IJson } from 'sener-types';

export const mime = MIME;

// Current version
const version = [ 0, 7, 9 ];

export interface Headers { [k: string]: any; }
export type Finish = (status: number, headers?: Headers) => void;
export type Callback = (e: Error|null, arg?: any) => void;

export interface Options {
 headers?: Headers | undefined;
 indexFile?: string | undefined;
 cache?: number | boolean | undefined;
 serverInfo?: Buffer | undefined;
 server?: string | undefined;
 gzip?: boolean | RegExp;
 'cache-control'?: string | undefined;
}

export interface ByteRange {
 from: number;
 to: number;
 valid: boolean;
}

export class StaticServer {
    root: string|null;
    options: Options;
    cache: number | boolean;
    defaultHeaders: Headers;
    serverInfo: string;
    constructor (root: string, options?: Options) {
        if (root && (typeof(root) === 'object')) {
            this.options = root;
            this.root = null;
        }

        // resolve() doesn't normalize (to lowercase) drive letters on Windows
        this.root = path.normalize(path.resolve(root || '.'));
        this.options = options || {};

        this.defaultHeaders  = {};
        this.options.headers = this.options.headers || {};

        this.options.indexFile = this.options.indexFile || 'index.html';

        this.cache = 3600;
        if ('cache' in this.options) {
            if (typeof(this.options.cache) === 'number') {
                this.cache = this.options.cache;
            } else if (! this.options.cache) {
                this.cache = 0;
            }
        }

        if ('serverInfo' in this.options) {
            this.serverInfo = this.options.serverInfo?.toString() || '';
        } else {
            this.serverInfo = 'node-static/' + version.join('.');
        }

        this.defaultHeaders['server'] = this.serverInfo;

        // if (this.cache !== false) {
        //     this.defaultHeaders['cache-control'] = 'max-age=' + this.cache;
        // }
        this.defaultHeaders['cache-control'] = 'max-age=' + this.cache;

        console.log('static-cache', this.defaultHeaders['cache-control'])

        for (const k in this.defaultHeaders) {
            this.options.headers[k] = this.options.headers[k] || this.defaultHeaders[k];
        }
    }
    serveDir (pathname: string, req: http.IncomingMessage, res: http.ServerResponse, finish: Finish): void {
        const htmlIndex = path.join(pathname, this.options.indexFile || ''),
            that = this;

        fs.stat(htmlIndex, function (e, stat) {
            if (!e) {
                const status = 200;
                const headers = {};
                const originalPathname = decodeURI(url.parse(req?.url ?? '').pathname || '');
                if (originalPathname.length && originalPathname.charAt(originalPathname.length - 1) !== '/') {
                    return finish(301, { 'Location': originalPathname + '/' });
                } else {
                    that.respond('', status, headers, [ htmlIndex ], stat, req, res, finish);
                }
            } else {
                // Stream a directory of files as a single file.
                fs.readFile(path.join(pathname, 'index.json'), function (e, contents) {
                    if (e) { return finish(404, {}); }
                    // @ts-ignore
                    const index = JSON.parse(contents);
                    streamFiles(index.files);
                });
            }
        });
        function streamFiles (files: any) {
            mstat(pathname, files, function (e: any, stat: any) {
                if (e) { return finish(404, {}); }
                that.respond(pathname, 200, {}, files, stat, req, res, finish);
            });
        }
    }
    serveFile (pathname: string, status: number, headers: Headers, req: http.IncomingMessage, res: http.ServerResponse): events.EventEmitter {
        const that = this;
        const promise = new(events.EventEmitter);

        pathname = this.resolve(pathname);

        fs.stat(pathname, function (e, stat) {
            if (e) {
                return promise.emit('error', e);
            }
            that.respond('', status, headers, [ pathname ], stat, req, res, function (status, headers) {
                // @ts-ignore
                that.finish(status, headers, req, res, promise);
            });
        });
        return promise;
    }

    finish (status: number, headers: Headers, req: http.IncomingMessage, res: http.ServerResponse, promise: events.EventEmitter, callback?: Callback) {
        const result = {
            status: status,
            headers: headers,
            message: http.STATUS_CODES[status]
        };

        headers['server'] = this.serverInfo;

        if (!status || status >= 400) {
            if (callback) {
                // @ts-ignore
                callback(result);
            } else {
                if (promise.listeners('error').length > 0) {
                    promise.emit('error', result);
                }
                else {
                    res.writeHead(status, headers);
                    res.end();
                }
            }
        } else {
            // Don't end the request here, if we're streaming;
            // it's taken care of in `prototype.stream`.
            if (status !== 200 || req.method !== 'GET') {
                res.writeHead(status, headers);
                res.end();
            }
            callback && callback(null, result);
            promise.emit('success', result);
        }
    }
    servePath (pathname: string, status: number, headers: Headers, req: http.IncomingMessage, res: http.ServerResponse, finish: Finish): events.EventEmitter {
        const that = this,
            promise = new(events.EventEmitter);

        pathname = this.resolve(pathname);

        // Make sure we're not trying to access a
        // file outside of the root.
        if (pathname.indexOf(that.root || '') === 0) {
            fs.stat(pathname, function (e, stat) {
                if (e) {
                    finish(404, {});
                } else if (stat.isFile()) {   // Stream a single file.
                    that.respond('', status, headers, [ pathname ], stat, req, res, finish);
                } else if (stat.isDirectory()) { // Stream a directory of files.
                    that.serveDir(pathname, req, res, finish);
                } else {
                    finish(400, {});
                }
            });
        } else {
            // Forbidden
            finish(403, {});
        }
        return promise;
    }
    resolve (pathname: string) {
        return path.resolve(path.join(this.root || '', pathname));
    }
    // @ts-ignore
    serve (req: http.IncomingMessage, res: http.ServerResponse, callback?: Callback): events.EventEmitter {
        const that = this;
        const promise = new(events.EventEmitter);
        let pathname = '';

        // @ts-ignore
        const finish = function (status, headers) {
            that.finish(status, headers, req, res, promise, callback);
        };

        try {
            // @ts-ignore
            pathname = decodeURI(url.parse(req.url).pathname);
        }
        catch (e) {
            // @ts-ignore
            return process.nextTick(function () {
                return finish(400, {});
            });
        }

        process.nextTick(function () {
            that.servePath(pathname, 200, {}, req, res, finish).on('success', function (result) {
                promise.emit('success', result);
            }).on('error', function (err: any) {
                promise.emit('error', err);
            });
        });
        if (! callback) { return promise; }
    }
    /* Check if we should consider sending a gzip version of the file based on the
  * file content type and client's Accept-Encoding header value.
  */
    gzipOk (req: http.IncomingMessage, contentType: string): boolean {
        const enable = this.options.gzip;
        if (enable && (typeof enable === 'boolean' || (contentType && (enable instanceof RegExp) && enable.test(contentType)))) {
            const acceptEncoding = req.headers['accept-encoding'];
            return !!acceptEncoding && acceptEncoding.indexOf('gzip') >= 0;
        }
        return false;
    }
    /* Send a gzipped version of the file if the options and the client indicate gzip is enabled and
  * we find a .gz file mathing the static resource requested.
  */
    respondGzip (
        pathname: string,
        status: number,
        contentType: string,
        _headers: Headers,
        files: string[],
        stat: fs.Stats,
        req: http.IncomingMessage,
        res: http.ServerResponse,
        finish: Finish
    ): void {
        const that = this;
        if (files.length == 1 && this.gzipOk(req, contentType)) {
            const gzFile = files[0] + '.gz';
            fs.stat(gzFile, function (e, gzStat) {
                if (!e && gzStat.isFile()) {
                    const vary = _headers['Vary'];
                    _headers['Vary'] = (vary && vary != 'Accept-Encoding' ? vary + ', ' : '') + 'Accept-Encoding';
                    _headers['Content-Encoding'] = 'gzip';
                    stat.size = gzStat.size;
                    files = [ gzFile ];
                }
                that.respondNoGzip(pathname, status, contentType, _headers, files, stat, req, res, finish);
            });
        } else {
            // Client doesn't want gzip or we're sending multiple files
            that.respondNoGzip(pathname, status, contentType, _headers, files, stat, req, res, finish);
        }
    }
    parseByteRange (req: http.IncomingMessage, stat: fs.Stats) : ByteRange {
        const byteRange = {
            from: 0,
            to: 0,
            valid: false
        };

        const rangeHeader = req.headers['range'];
        const flavor = 'bytes=';

        if (rangeHeader) {
            if (rangeHeader.indexOf(flavor) == 0 && rangeHeader.indexOf(',') == -1) {
                /* Parse */
                const list = rangeHeader.substr(flavor.length).split('-');
                byteRange.from = parseInt(list[0]);
                byteRange.to = parseInt(list[1]);

                /* Replace empty fields of differential requests by absolute values */
                if (isNaN(byteRange.from) && !isNaN(byteRange.to)) {
                    byteRange.from = stat.size - byteRange.to;
                    byteRange.to = stat.size ? stat.size - 1 : 0;
                } else if (!isNaN(byteRange.from) && isNaN(byteRange.to)) {
                    byteRange.to = stat.size ? stat.size - 1 : 0;
                }

                /* General byte range validation */
                if (!isNaN(byteRange.from) && !!byteRange.to && 0 <= byteRange.from && byteRange.from < byteRange.to) {
                    byteRange.valid = true;
                } else {
                    console.warn('Request contains invalid range header: ', list);
                }
            } else {
                console.warn('Request contains unsupported range header: ', rangeHeader);
            }
        }
        return byteRange;
    }
    respondNoGzip (pathname: string, status: number, contentType: string, _headers: Headers, files: string[], stat: fs.Stats, req: http.IncomingMessage, res: http.ServerResponse, finish: Finish) {
        // @ts-ignore
        const mtime = Date.parse(stat.mtime);
        const key = pathname || files[0];
        const headers: IJson   = {};
        const clientETag   = req.headers['if-none-match'];
        const clientMTime  = Date.parse(req.headers['if-modified-since'] || '');
        let startByte = 0;
        let length = stat.size;
        const byteRange = this.parseByteRange(req, stat);

        /* Handle byte ranges */
        if (files.length == 1 && byteRange.valid) {
            if (byteRange.to < length) {

                // Note: HTTP Range param is inclusive
                startByte = byteRange.from;
                length = byteRange.to - byteRange.from + 1;
                status = 206;

                // Set Content-Range response header (we advertise initial resource size on server here (stat.size))
                headers['Content-Range'] = 'bytes ' + byteRange.from + '-' + byteRange.to + '/' + stat.size;

            } else {
                byteRange.valid = false;
                console.warn('Range request exceeds file boundaries, goes until byte no', byteRange.to, 'against file size of', length, 'bytes');
            }
        }

        /* In any case, check for unhandled byte range headers */
        if (!byteRange.valid && req.headers['range']) {
            console.error(new Error('Range request present but invalid, might serve whole file instead'));
        }

        // Copy default headers
        for (const k in this.options.headers) {  headers[k] = this.options.headers[k]; }
        // Copy custom headers
        for (const k in _headers) { headers[k] = _headers[k]; }

        headers['Etag'] = JSON.stringify([ stat.ino, stat.size, mtime ].join('-'));
        headers['Date'] = new(Date)().toUTCString();
        headers['Last-Modified'] = new(Date)(stat.mtime).toUTCString();
        headers['Content-Type']   = contentType;
        headers['Content-Length'] = length;

        for (const k in _headers) { headers[k] = _headers[k]; }

        // Conditional GET
        // If the "If-Modified-Since" or "If-None-Match" headers
        // match the conditions, send a 304 Not Modified.
        if ((clientMTime  || clientETag) &&
   (!clientETag  || clientETag === headers['Etag']) &&
   (!clientMTime || clientMTime >= mtime)) {
            // 304 response should not contain entity headers
            [ 'Content-Encoding',
                'Content-Language',
                'Content-Length',
                'Content-Location',
                'Content-MD5',
                'Content-Range',
                'Content-Type',
                'Expires',
                'Last-Modified' ].forEach(function (entityHeader) {
                delete headers[entityHeader];
            });
            finish(304, headers);
        } else {
            res.writeHead(status, headers);
            this.stream(key, files, length, startByte, res, function (e) {
                if (e) { return finish(500, {}); }
                finish(status, headers);
            });
        }
    }
    respond (pathname: string, status: number, _headers: Headers, files: string[], stat: fs.Stats, req: http.IncomingMessage, res: http.ServerResponse, finish: Finish) {
        const contentType = _headers['Content-Type'] || mime.getType(files[0]) || 'application/octet-stream';

        if (this.options.gzip) {
            this.respondGzip(pathname, status, contentType, _headers, files, stat, req, res, finish);
        } else {
            this.respondNoGzip(pathname, status, contentType, _headers, files, stat, req, res, finish);
        }
    }
    stream (pathname: string, files: string[], length: number, startByte: number, res: http.ServerResponse, callback: Callback) {

        (function streamFile (files, offset) {
            let file = files.shift();

            if (file) {
                file = path.resolve(file) === path.normalize(file)  ? file : path.join(pathname || '.', file);

                // Stream the file to the client
                fs.createReadStream(file, {
                    flags: 'r',
                    mode: 666,
                    start: startByte,
                    end: startByte + (length ? length - 1 : 0)
                }).on('data', function (chunk) {
                    // Bounds check the incoming chunk and offset, as copying
                    // a buffer from an invalid offset will throw an error and crash
                    if (chunk.length && offset < length && offset >= 0) {
                        offset += chunk.length;
                    }
                }).on('close', function () {
                    streamFile(files, offset);
                }).on('error', function (err) {
                    callback(err);
                    console.error(err);
                }).pipe(res, { end: false });
            } else {
                res.end();
                callback(null, offset);
            }
        })(files.slice(0), 0);
    }
}


