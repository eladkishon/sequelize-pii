import {DataTypes, Sequelize} from "sequelize";

import customerBuilder from "./customer";

async function main() {
    const sequelize = new Sequelize({database: 'test', dialect: 'mysql', username: 'root', password: 'my-secret-pw' })
    await sequelize.authenticate()
    console.log('Connection has been established successfully.');
    const Customer = customerBuilder(sequelize, DataTypes)
    await Customer.sync()
    const platform_customer_id = '123457999'
    await Customer.create({
        shop_url: 'https://example.com',
        login_email: '',
        platform_customer_id,
        loyalty_card_id: '',
        profile: {
            first_name: 'Elad',
            last_name: 'Kishon'
        },
        status: '',
        metrics: '',
        search_terms: ''
    })

    const customer = await Customer.findOne({where: {platform_customer_id}})
    console.log(customer.profile)
}

main().catch(err => {
    console.error('Unable to connect to the database:', err);
})
