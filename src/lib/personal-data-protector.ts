import {DataTypes, InferAttributes, Model, ModelAttributes} from "sequelize";
import {InitOptions} from "sequelize/types/model";

import {EncryptedField, EncryptedFieldSearchOptions} from "./encrypted-field";

type PersonalDataProtectorOptions = { searchableKeysPaths?: Array<string> }

export class PersonalDataProtector<M extends Model, K extends keyof M> {
    private protected_fields: Array<string>;
    private encryptedField: EncryptedField;
    private readonly options: PersonalDataProtectorOptions = {searchableKeysPaths: []}

    constructor(keys: Array<K>, key, options?: PersonalDataProtectorOptions) {
        this.encryptedField = new EncryptedField(key,
            {
                searchOptions: {
                    searchableKeysPaths: options.searchableKeysPaths,
                    fullTextIndexFieldName: 'search_terms'
                } as EncryptedFieldSearchOptions
            })
        this.protected_fields = keys as Array<string>;
        this.options = Object.assign(this.options, options);
    }

    private isSearchEnabled(): boolean {
        return this.options.searchableKeysPaths?.length > 0
    }

    // We want to accept attributes except the ones we protect since these are the attributes this module generates automatically.
    addProtectedInitAttributes(attributes: Omit<ModelAttributes<M, InferAttributes<M>>, K>): ModelAttributes<M, InferAttributes<M>> {
        const addedAttributes: Partial<ModelAttributes<M>> = {
            pii_encrypted: this.encryptedField.vault('pii_encrypted'),
        }

        if (this.options.searchableKeysPaths?.length) {
            addedAttributes.search_terms = DataTypes.STRING
        }
        // create an object with the keys of the protected fields
        // and the values of the protected fields
        this.protected_fields.reduce((acc, key) => {
            acc[key] = this.encryptedField.field(key);
            return acc
        }, addedAttributes)
        return Object.assign(attributes, addedAttributes) as ModelAttributes<M, InferAttributes<M>>
    }

    addProtectionInitOptions(initOptions: InitOptions<M>): InitOptions<M> {
        const protectedInitOptions: { indexes?: Array<unknown> } = {}
        if (this.isSearchEnabled()) {
            protectedInitOptions.indexes = protectedInitOptions.indexes || []
            protectedInitOptions.indexes.push({
                fields: ['search_terms'],
                type: 'FULLTEXT',
            })

        }
        return Object.assign(initOptions, protectedInitOptions)
    }
}