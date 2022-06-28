import customerBuilder from "./customer";
import sequelize from "./sequelize";

async function main() {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.');
    const Customer = customerBuilder(sequelize)
    await Customer.sync()
    const createdCustomer = await Customer.create({
        shop_url: 'https://example.com',
        login_email: '',
        loyalty_card_id: '',
        profile: {
            first_name: 'Elad',
            last_name: 'Kishon'
        },
        status: '',
        metrics: '',
    })

    const customer = await Customer.findOne({where: {customer_id: createdCustomer.customer_id}})
    console.log(customer.profile)
}

main().catch(err => {
    console.error('Unable to connect to the database:', err);
})
