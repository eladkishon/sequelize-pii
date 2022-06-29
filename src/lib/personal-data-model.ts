import {InferAttributes, Model} from "sequelize";
import {InitOptions, ModelAttributes, ModelStatic} from "sequelize/types/model";

import {PersonalDataProtector} from "./personal-data-protector";


const modelInitRef = Model.init


interface PIIInternalClassOptions {
    encryptionKey: string;
    enableSearch: boolean;
    protectedKeys: Array<string>;
    searchableKeysPaths: Array<string>;
}

interface PIIClassConfig {
    encryptionKey: string;
    enableSearch: boolean;
}

interface PIIFieldConfig {
    searchable?: boolean | Array<string>;
}


const defaultPIIInternalClassOptions: PIIInternalClassOptions = {
    enableSearch: false,
    encryptionKey: "",
    protectedKeys: [],
    searchableKeysPaths: []
}

export function PIIField(config: PIIFieldConfig = {}) {
    return (object, member) => {
        const piiInternalClassOptions: PIIInternalClassOptions = object.constructor.piiInternalClassOptions || defaultPIIInternalClassOptions;

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


export function PIIClass(config: PIIClassConfig) {
    return (constructor) => {
        const piiInternalClassOptions: PIIInternalClassOptions = constructor.piiInternalClassOptions || defaultPIIInternalClassOptions;
        piiInternalClassOptions.encryptionKey = config.encryptionKey;
        piiInternalClassOptions.enableSearch = config.enableSearch;
        constructor.piiInternalClassOptions = piiInternalClassOptions;
    }
}

export abstract class PersonalDataModel<TModelAttributes, TCreationAttributes> extends Model<TModelAttributes, TCreationAttributes> {
    // TODO: Do we need this ? or just keep for readability ? should we add search_terms here?
    protected pii_encrypted: Buffer

    public static initWithProtection<MS extends ModelStatic<Model>, M extends InstanceType<MS>>(
        this: MS,
        attributes: Partial<ModelAttributes<M, InferAttributes<M>>>,
        options: InitOptions<M>
    ): MS {
        const staticThis = this as unknown as { piiInternalClassOptions: PIIInternalClassOptions };
        const piiInternalClassOptions = staticThis.piiInternalClassOptions;
        const personalDataProtector = new PersonalDataProtector(piiInternalClassOptions.protectedKeys as never,
            piiInternalClassOptions.encryptionKey,
            {
                enableSearch: piiInternalClassOptions.enableSearch,
                searchableKeysPaths: piiInternalClassOptions.searchableKeysPaths
            })
        return modelInitRef.call(this, personalDataProtector.addProtectedInitAttributes(attributes), personalDataProtector.addProtectionInitOptions(options))
    }
}

