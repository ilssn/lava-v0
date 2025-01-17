"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SchemaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaService = void 0;
const common_1 = require("@nestjs/common");
const schema_interface_1 = require("../interfaces/schema.interface");
let SchemaService = SchemaService_1 = class SchemaService {
    constructor() {
        this.logger = new common_1.Logger(SchemaService_1.name);
    }
    validateSchema(schema) {
        try {
            this.validateSchemaStructure(schema);
            return true;
        }
        catch (error) {
            this.logger.error(`Schema validation failed: ${error.message}`);
            return false;
        }
    }
    validateSchemaStructure(schema, path = '') {
        for (const [key, field] of Object.entries(schema)) {
            const currentPath = path ? `${path}.${key}` : key;
            if (this.isSchemaField(field)) {
                this.validateField(field, currentPath);
            }
            else {
                this.validateSchemaStructure(field, currentPath);
            }
        }
    }
    isSchemaField(field) {
        return field.type !== undefined;
    }
    validateField(field, path) {
        if (!Object.keys(schema_interface_1.DEFAULT_VALUES).includes(field.type)) {
            throw new Error(`Invalid type "${field.type}" at ${path}`);
        }
        if (field.type === 'array' && !field.items) {
            throw new Error(`Array field at ${path} must specify 'items'`);
        }
    }
    validateData(data, schema) {
        const errors = [];
        this.validateDataAgainstSchema(data, schema, '', errors);
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validateDataAgainstSchema(data, schema, path, errors) {
        for (const [key, field] of Object.entries(schema)) {
            const currentPath = path ? `${path}.${key}` : key;
            const value = data?.[key];
            if (this.isSchemaField(field)) {
                this.validateValue(value, field, currentPath, errors);
            }
            else {
                if (typeof value !== 'object' || value === null) {
                    errors.push(`Invalid object at ${currentPath}`);
                    continue;
                }
                this.validateDataAgainstSchema(value, field, currentPath, errors);
            }
        }
    }
    validateValue(value, field, path, errors) {
        if (value === undefined || value === null) {
            if (field.required) {
                errors.push(`Required field ${path} is missing`);
            }
            return;
        }
        switch (field.type) {
            case 'string':
                if (typeof value !== 'string') {
                    errors.push(`${path} must be a string`);
                }
                break;
            case 'number':
            case 'float':
                if (typeof value !== 'number') {
                    errors.push(`${path} must be a number`);
                }
                break;
            case 'boolean':
                if (typeof value !== 'boolean') {
                    errors.push(`${path} must be a boolean`);
                }
                break;
            case 'array':
                if (!Array.isArray(value)) {
                    errors.push(`${path} must be an array`);
                }
                else if (field.items) {
                    value.forEach((item, index) => {
                        if (typeof field.items === 'string') {
                            if (typeof item !== field.items) {
                                errors.push(`${path}[${index}] must be of type ${field.items}`);
                            }
                        }
                        else {
                            this.validateDataAgainstSchema(item, field.items, `${path}[${index}]`, errors);
                        }
                    });
                }
                break;
        }
    }
    getDefaultValue(field) {
        if (this.isSchemaField(field)) {
            const schemaField = field;
            if (schemaField.defaultValue !== undefined) {
                return schemaField.defaultValue;
            }
            if (schemaField.type === 'array' && schemaField.items) {
                return [];
            }
            return schema_interface_1.DEFAULT_VALUES[schemaField.type];
        }
        const defaultObj = {};
        for (const [key, value] of Object.entries(field)) {
            defaultObj[key] = this.getDefaultValue(value);
        }
        return defaultObj;
    }
};
exports.SchemaService = SchemaService;
exports.SchemaService = SchemaService = SchemaService_1 = __decorate([
    (0, common_1.Injectable)()
], SchemaService);
//# sourceMappingURL=schema.service.js.map