import type {InferAttributes, InferCreationAttributes, Sequelize} from "sequelize";
import {DataTypes, UUID} from "sequelize";

import {PersonalDataModel, PersonalDataProtector} from "../lib/personal-data-model";


export class Customer
    extends PersonalDataModel<InferAttributes<Customer>, InferCreationAttributes<Customer>> {
    declare id: number;
    declare customer_id: string;
    declare shop_url: string;
    declare login_email: string;
    declare platform_customer_id: string;
    declare loyalty_card_id: string;
    declare profile: {
        first_name: string;
        last_name: string;
    };
    declare status: string;
    declare metrics: unknown;
}


// secret key should be 32 bytes hex encoded (64 characters)
const key = 'ac10ab87d48fec5d0a95d2fa341fa9d93ed632c6c5e4c472cf80c865bf04bf8d'


const personalDataProtector = new PersonalDataProtector<Customer>(['profile'], key )




export default function (sequelize: Sequelize) {
    Customer.init(
        personalDataProtector.addProtectedAttributes(
        {

            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            customer_id: {
                type: UUID,
                unique: true,
                defaultValue: DataTypes.UUIDV4,
            },
            platform_customer_id: {
                type: DataTypes.STRING,
                unique: true,
            },
            metrics: DataTypes.JSON,
        }),
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


    return Customer;
}
