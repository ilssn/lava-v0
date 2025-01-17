export type SchemaType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'float';
export interface SchemaField {
    type: SchemaType;
    items?: SchemaDefinition | SchemaType;
    required?: boolean;
    description?: string;
    defaultValue?: any;
}
export interface SchemaDefinition {
    [key: string]: SchemaField | SchemaDefinition;
}
export interface ExtractedData {
    [key: string]: any;
}
export declare const DEFAULT_VALUES: Record<SchemaType, any>;
