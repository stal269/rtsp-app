import { DbURL } from './models/url.model';
import { URL } from './models/url.model';
import { User, DbUser } from './models/user.model';
import { MongoClient, Collection, Db, MongoError, InsertOneWriteOpResult, ObjectId } from 'mongodb';

export class Dao {

    private static readonly DB_URL: string = 'mongodb://localhost:27017';
    private static readonly dbName: string = 'rtsp_db';

    private client: MongoClient;

    constructor() {
        this.client = new MongoClient(Dao.DB_URL);
    }

    createUser(user: User): Promise<string> {
        return this.connect()
            .then((db: Db) => this.getExistingUsers(db))
            .then((users: User[]) => this.validateEmailUniqueness(users, user))
            .then(() => this.insertUser(user));
    }

    getUser(email: string): Promise<User> {
        return this.connect()
            .then((db: Db) => {
                const users: Collection = db.collection('users');

                return users.findOne({ email });
            });
    }

    setUrlForUser(userId: string, url: string): Promise<string> {
        return this.connect()
            .then((db: Db) => {
                return db.collection('urls').findOne({ url })
                    .then((urlDocument: DbURL) => {
                        if (urlDocument === null) {
                            return db.collection('urls').insertOne({ url })
                                .then((result: InsertOneWriteOpResult<any>) => {
                                    return result.insertedId;
                                });
                        }

                        return urlDocument._id;
                    })
                    .then((urlId: string) => {
                        return db.collection('users')
                            .updateOne(
                                { _id: new ObjectId(userId) },
                                { $addToSet: { urlIds: urlId } })
                            .then(() => {
                                return urlId;
                            });
                    });
            });
    }

    getUrlsByUserId(userId: string): Promise<URL[]> {
        return this.connect()
            .then((db: Db) => {
                return db.collection('users').findOne({ _id: new ObjectId(userId) })
                    .then((user: DbUser) => {
                        return user.urlIds && user.urlIds.length ?
                            db.collection('urls')
                                .find({_id: {$in: user.urlIds}})
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
            });
    }

    private connect(): Promise<Db> {
        return this.client.connect()
            .then(() => {
                return this.client.db(Dao.dbName);
            })
            .catch((err: MongoError) => {
                console.log('error connecting to the db');
                console.log(err);

                return null;
            });
    }

    private getExistingUsers(db: Db): Promise<User[]> {
        const users: Collection = db.collection('users');

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
        const db: Db = this.client.db(Dao.dbName);
        const users: Collection = db.collection('users');

        return users.insertOne(user)
            .then((result: InsertOneWriteOpResult<any>) => {
                const id: string = result.insertedId;
                console.log(`user with id ${id} was created`);

                return id;
            })
            .catch((error: MongoError) => {
                throw error;
            })
            .finally(() => {
                this.client.close();
            });
    }

}

const dao = new Dao();
export default dao;