import express from 'express';
import cookieSession from 'cookie-session';
import { Express, Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import daoInstance, { Dao } from './db';
import { hash, compare } from 'bcrypt';
import { User } from './models/user.model';
import { URL } from './models/url.model';

class App {

    public express: Express;

    constructor(private dao: Dao) {
        this.express = express();
        this.registerRoutes();
    }

    private registerRoutes(): void {
        this.express
            //todo: we probably need to ckeck the request.session object
            // for internal app requests after login
            .use(cookieSession({
                name: 'session',
                keys: ['encrypt', 'decrypt'],
                maxAge: 1000 * 60 * 30
            }))
            .use('/', express.static(path.join(__dirname, '../', 'frontend', 'dist')))
            .use(bodyParser.json())
            .post('/rtsp/users',
                this.encryptPassword.bind(this),
                this.createUser.bind(this)
            )
            .post('/rtsp/users/login', this.loginUser.bind(this))
            //consider putting next two under the same route
            .post('/rtsp/users/:id/urls', this.addUrlToUser.bind(this))
            .get('/rtsp/users/:id/urls', this.getUrlsByUserId.bind(this))
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

                            response.sendStatus(200);

                            return;
                        }

                        response.sendStatus(401);
                    });
            });
    };

    private addUrlToUser(request: Request, response: Response): void {
        this.dao.setUrlForUser(request.params.userId, request.body.url)
            .then((urlId: string) => {
                response.status(200)
                    .json({ id: urlId });
            });
    }

    private getUrlsByUserId(request: Request, response: Response): void {
        this.dao.getUrlsByUserId(request.params.userId)
            .then((urls: URL[]) => {
                response.status(200)
                    .json({urls});
            });
    }

}

export default new App(daoInstance);