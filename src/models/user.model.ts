interface BaseUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface User extends BaseUser {
    id: string;
}

export interface DbUser extends BaseUser {
    _id: string;
    urlIds?: string[];
}