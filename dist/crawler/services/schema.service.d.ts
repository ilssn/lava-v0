import { SchemaDefinition, SchemaField } from '../interfaces/schema.interface';
export declare class SchemaService {
    private readonly logger;
    validateSchema(schema: SchemaDefinition): boolean;
    private validateSchemaStructure;
    private isSchemaField;
    private validateField;
    validateData(data: any, schema: SchemaDefinition): {
        isValid: boolean;
        errors: string[];
    };
    private validateDataAgainstSchema;
    private validateValue;
    getDefaultValue(field: SchemaField | SchemaDefinition): any;
}
