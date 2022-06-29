import type {InferAttributes, InferCreationAttributes, Sequelize} from "sequelize";
import {DataTypes, UUID} from "sequelize";

import {PersonalDataModel, PIIClass, PIIField} from "../lib/personal-data-model";

@PIIClass
export class Customer extends PersonalDataModel<InferAttributes<Customer>, InferCreationAttributes<Customer>> {
    declare id: number;
    declare customer_id: string;
    declare shop_url: string;
    declare login_email: string;
    declare platform_customer_id: string;
    declare loyalty_card_id: string;
    @PIIField
    declare profile: {
        first_name: string;
        last_name: string;
    };
    declare status: string;
    declare metrics: unknown;
}

export default function (sequelize: Sequelize) {
    Customer.init(
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
            login_email: DataTypes.STRING,
            loyalty_card_id: DataTypes.STRING,
            shop_url: DataTypes.STRING,
            status: DataTypes.STRING
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
        }
    );



    return Customer;
}
