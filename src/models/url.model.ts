interface BaseURL {
    url: string;
}

export interface DbURL extends BaseURL {
    _id: string;
}

export interface URL extends BaseURL {
    id: string;
}