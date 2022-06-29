import {InferAttributes, Model} from "sequelize";
import {InitOptions, ModelAttributes, ModelStatic} from "sequelize/types/model";

import {PersonalDataProtector} from "./personal-data-protector";
const key = 'ac10ab87d48fec5d0a95d2fa341fa9d93ed632c6c5e4c472cf80c865bf04bf8d'


const modelInitRef = Model.init

export function PIIField(object, member) {
    object.constructor.protected_keys = object.constructor.protected_keys || [];
    object.constructor.protected_keys.push(member);
}
export function PIIClass(object) {
    object.constructor.init = (attributes, options) => {
            const staticThis = this as unknown as {protected_keys}
            const protected_keys = staticThis.protected_keys || [];
            const personalDataProtector = new PersonalDataProtector(protected_keys, key, {enableSearch: true});
            return modelInitRef.call(this, personalDataProtector.addProtectedInitAttributes(attributes), personalDataProtector.addProtectionInitOptions(options))
    }
}

export abstract class PersonalDataModel<TModelAttributes, TCreationAttributes> extends Model<TModelAttributes, TCreationAttributes> {
    // TODO: Do we need this ? or just keep for readability ? should we add search_terms here?
    protected pii_encrypted: Buffer
    public static init<MS extends ModelStatic<Model>, M extends InstanceType<MS>>(
        this: MS,
        attributes: ModelAttributes<M, InferAttributes<M, >>,
        options: InitOptions<M>
    ): MS {
        return modelInitRef.call(this, attributes, options)
    }
}

