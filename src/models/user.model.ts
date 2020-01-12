//TODO: reorganise the model

interface BaseUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface User {
    password: string;
    email: string;
    id: string;
}

export interface DbUser extends BaseUser {
    _id: string;
    urlIds?: string[];
}