import { CategoryResponse, TextResponse } from './types';

const BASE_URL = 'https://test-task-server.mediolanum.f17y.com';


export const fetchRandomItems = async (): Promise<CategoryResponse> => {
    const response = await fetch(`${BASE_URL}/items/random`);
    if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.statusText}`);
    }
    return response.json();
};

export const fetchItemText = async (id: string): Promise<TextResponse> => {
    const response = await fetch(`${BASE_URL}/texts/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch text: ${response.statusText}`);
    }
    return response.json();
};
