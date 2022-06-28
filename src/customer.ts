import {
    InferAttributes,
    InferCreationAttributes,
    Model,
    Sequelize,
    UUID,
} from 'sequelize';

import {EncryptedField} from "./encrypted-field";

export interface Customer {
    id: number;
    customer_id: string;
    shop_url: string;
    login_email: string;
    platform_customer_id: string;
    loyalty_card_id: string;
    profile: {
        first_name: string;
        last_name: string;
    };
    status: string;
    metrics: unknown;
}

export type EncryptedString = string;

// export interface CustomerDbModel
//     extends Omit<Customer, 'profile' | 'login_email'> {
//     profile: EncryptedString;
//     login_email: EncryptedString;
//     search_terms: string;
// }

export class CustomerModel
    extends Model<InferAttributes<CustomerModel>,
        InferCreationAttributes<CustomerModel>>
    implements Customer {
    customer_id: string;
    id: number;
    login_email: EncryptedString;
    loyalty_card_id: string;
    metrics: unknown;
    platform_customer_id: string;
    search_terms: string;
    shop_url: string;
    status: string;
    pii_encrypted: Buffer
    profile: { first_name: string; last_name: string };
}

// secret key should be 32 bytes hex encoded (64 characters)
const key = 'ac10ab87d48fec5d0a95d2fa341fa9d93ed632c6c5e4c472cf80c865bf04bf8d'

const encryptedField = new EncryptedField(Sequelize, key);

export default function (sequelize: Sequelize, DataTypes) {
    CustomerModel.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            pii_encrypted: encryptedField.vault('pii_encrypted'),
            customer_id: {
                type: UUID,
                unique: true,
                defaultValue: DataTypes.UUIDV4,
            },
            shop_url: DataTypes.STRING,
            login_email: DataTypes.TEXT,
            platform_customer_id: {
                type: DataTypes.STRING,
                unique: true,
            },
            loyalty_card_id: DataTypes.STRING,
            profile: encryptedField.field('profile'),
            status: DataTypes.STRING,
            metrics: DataTypes.JSON,
            search_terms: DataTypes.STRING,
        },
        {
            sequelize: sequelize,
            tableName: 'customers',
            underscored: true,
            timestamps: true,
            paranoid: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
            indexes: [
                // full text index on search_terms
                {
                    fields: ['search_terms'],
                    type: 'FULLTEXT',
                }
            ],
        }
    );

    return CustomerModel;
}
