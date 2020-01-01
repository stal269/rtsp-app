import {URL} from './url.model';

export interface User {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    urls?: URL[];
}