import {DataTypes, InferAttributes, Model, ModelAttributes} from "sequelize";
import {InitOptions} from "sequelize/types/model";

import {EncryptedField} from './encrypted-field';

type PersonalDataProtectorOptions = {enableSearch: boolean}

export class PersonalDataProtector<M extends Model, K extends keyof M> {
    private protected_fields: Array<string>;
    private encryptedField: EncryptedField;
    private readonly options:PersonalDataProtectorOptions  = {enableSearch: true}

    constructor(keys: Array<K>, key, options?:PersonalDataProtectorOptions) {
        this.encryptedField = new EncryptedField(key);
        this.protected_fields = keys as Array<string>;
        this.options = Object.assign(this.options, options);
    }

    addInitProtectedInitAttributes(attributes: Omit<ModelAttributes<M, InferAttributes<M>>, K>): ModelAttributes<M, InferAttributes<M>> {
        const protectedAttributes: Partial<ModelAttributes<M>> = {
            pii_encrypted: this.encryptedField.vault('pii_encrypted'),
        }
        if (this.options.enableSearch) {
            protectedAttributes.search_terms = DataTypes.STRING
        }
        // create an object with the keys of the protected fields
        // and the values of the protected fields
        this.protected_fields.reduce((acc, key) => {
            acc[key] = this.encryptedField.field(key);
            return acc
        }, protectedAttributes)
        return Object.assign(attributes, protectedAttributes) as ModelAttributes<M, InferAttributes<M>>
    }

    addProtectionInitOptions(initOptions: InitOptions<M>): InitOptions<M> {
        const protectedInitOptions: { indexes?: Array<unknown> } = {}
        if (this.options.enableSearch) {
            protectedInitOptions.indexes = protectedInitOptions.indexes || []
            protectedInitOptions.indexes.push({
                fields: ['search_terms'],
                type: 'FULLTEXT',
            })

        }
        return Object.assign(initOptions, protectedInitOptions)
    }
}

export abstract class PersonalDataModel<TModelAttributes, TCreationAttributes> extends Model<TModelAttributes, TCreationAttributes> {
    protected pii_encrypted: Buffer
}
