import {URL} from './url.model';

interface BaseUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface User extends BaseUser {
    urls?: URL[];
}

export interface DbUser extends BaseUser {
    urlIds?: string[];
}