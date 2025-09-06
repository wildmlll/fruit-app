export interface Item {
    id: string;
    name: string;
    image: string;
    color: string;
}

export interface CategoryResponse {
    title: string;
    items: Item[];
}

export interface TextResponse {
    id: string;
    text: string;
}
