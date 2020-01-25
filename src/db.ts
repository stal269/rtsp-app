import { DbURL } from './models/url.model';
import { URL } from './models/url.model';
import { User, DbUser } from './models/user.model';
import { MongoClient, Collection, Db, MongoError, InsertOneWriteOpResult, ObjectId } from 'mongodb';

export class Dao {

    private static readonly DB_URL: string = 'mongodb://mongo:27017';
    //private static readonly DB_URL: string = 'mongodb://localhost:27017';
    private static readonly dbName: string = 'rtsp_db';

    private client: MongoClient;
    private db: Db;

    constructor() {
        this.connect();
    }

    createUser(user: User): Promise<string> {
        return this.getExistingUsers()
            .then((users: User[]) => this.validateEmailUniqueness(users, user))
            .then(() => this.insertUser(user));
    }

    getUser(email: string): Promise<User> {
        const users: Collection = this.db.collection('users');

        return users.findOne({ email })
            .then((user: DbUser) => {

                return {
                    id: user._id,
                    email: user.email,
                    password: user.password
                };
            });
    }

    setUrlForUser(userId: string, url: string): Promise<string> {
        return this.db.collection('urls').findOne({ url })
            .then((urlDocument: DbURL) => {
                if (urlDocument === null) {
                    return this.db.collection('urls').insertOne({ url })
                        .then((result: InsertOneWriteOpResult<any>) => {
                            return result.insertedId;
                        });
                }

                return urlDocument._id;
            })
            .then((urlId: string) => {
                return this.db.collection('users')
                    .updateOne(
                        { _id: new ObjectId(userId) },
                        { $addToSet: { urlIds: urlId } })
                    .then(() => {
                        return urlId;
                    });
            });
    }

    getUrlsByUserId(userId: string): Promise<URL[]> {
        return this.db.collection('users').findOne({ _id: new ObjectId(userId) })
            .then((user: DbUser) => {
                return user.urlIds && user.urlIds.length ?
                    this.db.collection('urls')
                        .find({ _id: { $in: user.urlIds } })
                        .toArray() :
                    new Promise((resolve) => resolve([]));
            })
            .then((urls: DbURL[]) => {
                return urls.map(urlDoc => {
                    return {
                        url: urlDoc.url,
                        id: urlDoc._id
                    };
                });
            });
    }

    private connect(): void {
        let intervalId;
        this.client = new MongoClient(Dao.DB_URL);

        intervalId = setInterval(() => {
            this.client.connect()
                .then(() => {
                    clearInterval(intervalId);
                    this.db = this.client.db(Dao.dbName);
                })
                .catch((err: MongoError) => {
                    console.log('error connecting to the db');
                    console.log(err);
                });
        }, 5000);

    }

    private getExistingUsers(): Promise<User[]> {
        const users: Collection = this.db.collection('users');

        return users.find().toArray();
    }

    private validateEmailUniqueness(users: User[], user: User): Promise<void> {
        const isEmailExists = !!users.find(existingUser => existingUser.email === user.email);

        if (isEmailExists) {
            throw new Error('duplicateError');
        }

        return;
    }

    private insertUser(user: User): Promise<string> {
        const users: Collection = this.db.collection('users');

        return users.insertOne(user)
            .then((result: InsertOneWriteOpResult<any>) => {
                const id: string = result.insertedId;

                return id;
            })
            .catch((error: MongoError) => {
                throw error;
            });
    }

}

const dao = new Dao();
export default dao;