import {InferAttributes, Model} from "sequelize";
import {InitOptions, ModelAttributes, ModelStatic} from "sequelize/types/model";

import {PersonalDataProtector} from "./personal-data-protector";

export interface PIIProtectedClassConfig {
    encryptionKey: string;
}

export interface PIIProtectedFieldConfig {
    searchable?: boolean | Array<string>;
}

interface PersonalDataModelInternalClassOptions {
    encryptionKey: string;
    protectedKeys: Array<string>;
    enableSearch: boolean;
    searchableKeysPaths: Array<string>;
}

const defaultPersonalDataModelInternalClassOptions: PersonalDataModelInternalClassOptions = {
    enableSearch: false,
    encryptionKey: "",
    protectedKeys: [],
    searchableKeysPaths: []
}

export function PIIProtectedField(config: PIIProtectedFieldConfig = {}) {
    return (object, member) => {
        const piiInternalClassOptions: PersonalDataModelInternalClassOptions = object.constructor.piiInternalClassOptions || defaultPersonalDataModelInternalClassOptions;

        // If model field is an object searchable should be list of paths to searchable fields
        if (Array.isArray(config.searchable)) {
            piiInternalClassOptions.searchableKeysPaths.push(...config.searchable.map(key => `${member}.${key}`))
        }
        if (config.searchable === true) {
            piiInternalClassOptions.searchableKeysPaths.push(`${member}`)
        }
        piiInternalClassOptions.protectedKeys.push(member);
        object.constructor.piiInternalClassOptions = piiInternalClassOptions;
    }
}


export function PIIProtectedClass(config: PIIProtectedClassConfig) {
    return (constructor) => {
        const piiInternalClassOptions: PersonalDataModelInternalClassOptions = constructor.piiInternalClassOptions || defaultPersonalDataModelInternalClassOptions;
        piiInternalClassOptions.encryptionKey = config.encryptionKey;
        constructor.piiInternalClassOptions = piiInternalClassOptions;
    }
}


const modelInitRef = Model.init
export abstract class PersonalDataModel<TModelAttributes, TCreationAttributes> extends Model<TModelAttributes, TCreationAttributes> {
    protected pii_encrypted: Buffer
    protected search_terms: string

    public static initWithProtection<MS extends ModelStatic<Model>, M extends InstanceType<MS>>(
        this: MS,
        attributes: Partial<ModelAttributes<M, InferAttributes<M>>>,
        options: InitOptions<M>
    ): MS {
        const staticThis = this as unknown as { piiInternalClassOptions: PersonalDataModelInternalClassOptions };
        const piiInternalClassOptions = staticThis.piiInternalClassOptions;
        const personalDataProtector = new PersonalDataProtector(piiInternalClassOptions.protectedKeys as never,
            piiInternalClassOptions.encryptionKey,
            {
                searchableKeysPaths: piiInternalClassOptions.searchableKeysPaths
            })
        return modelInitRef.call(this, personalDataProtector.addProtectedInitAttributes(attributes), personalDataProtector.addProtectionInitOptions(options))
    }
}

