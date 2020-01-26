import express from 'express';
import cookieSession from 'cookie-session';
import { Express, Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import daoInstance, { Dao } from './db';
import { hash, compare } from 'bcrypt';
import { User } from './models/user.model';
import { URL } from './models/url.model';
import { setInterval } from 'timers';
const Stream = require('node-rtsp-stream');

class App {

    public express: Express;
    private stream: any;
    private intervalId: any;

    constructor(private dao: Dao) {
        this.express = express();
        this.registerRoutes();
        this.registerErrorGuards();
    }

    private registerRoutes(): void {
        this.express
            .use(cookieSession({
                name: 'session',
                keys: ['encrypt', 'decrypt'],
                maxAge: 1000 * 60 * 30
            }))
            .use(bodyParser.json())
            .put('/rtsp/stream', this.streamUrl.bind(this))
            .post('/rtsp/users',
                this.encryptPassword.bind(this),
                this.createUser.bind(this)
            )
            .post('/rtsp/users/login', this.loginUser.bind(this))
            .post('/rtsp/users/:id/urls', this.addUrlToUser.bind(this))
            .get('/rtsp/users/:id/urls', this.getUrlsByUserId.bind(this))
            .use('/**', this.handleStaticRequest.bind(this));
    }

    private createUser(request: Request, response: Response): void {
        this.dao.createUser(request.body)
            .then((id: string) => {
                response.status(200)
                    .json({ id });
            })
            .catch((error: Error) => {
                if (error.message === 'duplicateError') {
                    response.sendStatus(403);
                }
            });
    }

    private encryptPassword(request: Request, response: Response, next: NextFunction): void {
        const salt: number = 10;

        hash(request.body.password, salt, (err: Error, encrypted: string) => {
            if (err) {
                response.sendStatus(500);
            }

            request.body.password = encrypted;
            next();
        });
    }

    private loginUser(request: Request, response: Response): void {
        this.dao.getUser(request.body.email)
            .then((user: User) => {
                if (user === null) {
                    response.sendStatus(404);

                    return;
                }

                compare(request.body.password, user.password)
                    .then((isPassCorrect: boolean) => {
                        if (isPassCorrect) {
                            request.session = {
                                username: request.body.email
                            }

                            response.status(200);

                            response.json({
                                id: user.id
                            });

                            return;
                        }

                        response.sendStatus(401);
                    });
            })
            .catch((error: Error) => {
                console.log(error);
            });
    };

    private addUrlToUser(request: Request, response: Response): void {
        if (!request.session.populated) {
            response.sendStatus(403);

            return;
        }

        this.dao.setUrlForUser(request.params.id, request.body.url)
            .then((urlId: string) => {
                response.status(200)
                    .json({ id: urlId });
            });
    }

    private getUrlsByUserId(request: Request, response: Response): void {
        if (!request.session.populated) {
            response.sendStatus(403);

            return;
        }

        this.dao.getUrlsByUserId(request.params.id)
            .then((urls: URL[]) => {
                response.status(200)
                    .json({ urls });
            });
    }

    private handleStaticRequest(request: Request, response: Response): void {
        const url = request.baseUrl;
        const urlParts = url.split('/');
        const distPath = path.join(__dirname, '../', 'frontend', 'dist');

        if (url === '/' || !url.length || !urlParts[1].includes('.')) {
            response.sendFile(distPath + '/index.html');

            return;
        }

        response.sendFile(distPath + `/${urlParts[1]}`);
    }

    private streamUrl(request: Request, response: Response): void {
        if (!request.session.populated) {
            response.sendStatus(403);

            return;
        }

        if (this.stream) {
            this.stream.stop();
        }

        try {
            this.initStream(request.body.url);
            this.registerZeroClientsCheck();
        } catch (error) {
            console.log(error);
        }

        response.sendStatus(200);
    }

    private initStream(url: string) {
        this.stream = new Stream({
            name: 'rtsp-stream',
            streamUrl: url,
            wsPort: 5000,
            ffmpegOptions: {
                '-r': 30
            }
        });
    }

    private registerZeroClientsCheck(): void {
        if (this.intervalId) {
            return;
        }

        this.intervalId = setInterval(() => {
            if (this.stream && !this.stream.wsServer.clients.size) {
                this.stream.stop();
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        }, 2000);

    }

    //being used against errors thrown asynchronously from the rtsp lib
    registerErrorGuards() {
        process.on('uncaughtException', (err) => {
            console.log(err);
        });
    }

}

export default new App(daoInstance);