import crypto from "crypto";

export class EncryptedField {
    private key: Buffer;
    private _algorithm: string;
    private _iv_length: number;
    private encrypted_field_name: undefined;
    private Sequelize: any;
    constructor(Sequelize, key: string, opt?) {
        if (!(this instanceof EncryptedField)) {
            return new EncryptedField(Sequelize, key, opt);
        }

        this.key = new Buffer(key, 'hex');
        this.Sequelize = Sequelize;

        opt = opt || {};
        this._algorithm = opt.algorithm || 'aes-256-cbc';
        this._iv_length = opt.iv_length || 16;
        this.encrypted_field_name = undefined;
    };

    vault(fieldName)  {

        if (this.encrypted_field_name) {
            throw new Error('vault already initialized');
        }

        this.encrypted_field_name = fieldName;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        return {
            type: self.Sequelize.BLOB,
            get: function() {
                let previous = this.getDataValue(fieldName);
                if (!previous) {
                    return {};
                }

                previous = new Buffer(previous);

                const iv = previous.slice(0, self._iv_length);
                const content = previous.slice(self._iv_length, previous.length);
                const decipher = crypto.createDecipheriv(self._algorithm, self.key, iv);

                const json = decipher.update(content, undefined, 'utf8') + decipher.final('utf8');
                return JSON.parse(json);
            },
            set: function(value) {
                // if new data is set, we will use a new IV
                const new_iv = crypto.randomBytes(self._iv_length);

                const cipher = crypto.createCipheriv(self._algorithm, self.key, new_iv);

                cipher.end(JSON.stringify(value), 'utf-8');
                const enc_final = Buffer.concat([new_iv, cipher.read()]);
                this.setDataValue(fieldName, enc_final);
            }
        }
    };

    field(name, config?) {
        config = config || {};
        config.validate = config.validate || {};

        const hasValidations = [undefined,null].indexOf(typeof config.validate) === -1;

        if (!this.encrypted_field_name) {
            throw new Error('you must initialize the vault field before using encrypted fields');
        }

        const encrypted_field_name = this.encrypted_field_name;

        return {
            type: this.Sequelize.VIRTUAL(config.type || null),
            set: function set_encrypted(val) {

                if (hasValidations) {
                    this.setDataValue(name, val);
                }

                // use `this` not this because we need to reference the sequelize instance
                // not our EncryptedField instance
                const encrypted = this[encrypted_field_name];

                encrypted[name] = val;
                this[encrypted_field_name] = encrypted;
            },
            get: function get_encrypted() {
                const encrypted = this[encrypted_field_name];
                const val = encrypted[name];
                return ([undefined, null].indexOf(val) === -1) ? val : config.defaultValue;
            },
            allowNull: ([undefined, null].indexOf(config.allowNull) === -1) ? config.allowNull : true,
            validate: config.validate
        }
    };
}


