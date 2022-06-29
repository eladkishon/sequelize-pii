import {InferAttributes, Model} from "sequelize";
import {InitOptions, ModelAttributes, ModelStatic} from "sequelize/types/model";

import {PersonalDataProtector} from "./personal-data-protector";


const modelInitRef = Model.init


interface PIIInternalClassOptions {
    encryptionKey: string;
    enableSearch: boolean;
    protectedKeys: Array<string>;
}

interface PIIClassConfig {
    encryptionKey: string;
    enableSearch: boolean;
}

export function PIIField(object, member) {
    const piiInternalClassOptions = (object.constructor.piiInternalClassOptions || {protectedKeys: []} as PIIInternalClassOptions ) ;
    piiInternalClassOptions.protectedKeys.push(member);
    object.constructor.piiInternalClassOptions = piiInternalClassOptions;
}

export function PIIClass(config: PIIClassConfig) {
    return (constructor) => {
        const piiInternalClassOptions = (constructor.piiInternalClassOptions || {protectedKeys: []} as PIIInternalClassOptions ) ;
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
        const staticThis = this as unknown as {piiInternalClassOptions: PIIInternalClassOptions};
        const piiInternalClassOptions = staticThis.piiInternalClassOptions;
        const personalDataProtector = new PersonalDataProtector(piiInternalClassOptions.protectedKeys as never , piiInternalClassOptions.encryptionKey,{enableSearch: piiInternalClassOptions.enableSearch});
        return modelInitRef.call(this, personalDataProtector.addProtectedInitAttributes(attributes), personalDataProtector.addProtectionInitOptions(options))
    }
}

