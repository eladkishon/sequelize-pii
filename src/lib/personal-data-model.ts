import {DataTypes, Model, ModelAttributes} from "sequelize";

import {EncryptedField} from './encrypted-field';

export class PersonalDataProtector<M extends Model> {
    private protected_fields: Array<string>;
    private encryptedField: EncryptedField;
    private readonly options = {enableSearch: true}

    constructor(keys: Array<keyof M>, key, options? ) {
        this.encryptedField = new EncryptedField(key);
        this.protected_fields = keys as Array<string>;
        this.options = Object.assign(this.options, options);
    }

    addProtectedAttributes(attributes: ModelAttributes<M>): ModelAttributes<M> {
        const protectedAttributes : Partial<ModelAttributes<M>> = {
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
        return {...attributes, ...protectedAttributes}
    }
    addProtectionOptions(){

    }
}

export abstract class PersonalDataModel<TModelAttributes, TCreationAttributes> extends Model<TModelAttributes, TCreationAttributes>{
    protected pii_encrypted: Buffer
}
