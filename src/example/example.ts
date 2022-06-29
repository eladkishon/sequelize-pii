import customerBuilder from "./customer";
import sequelize from "./sequelize";

async function main() {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.');
    const Customer = customerBuilder(sequelize)
    await Customer.sync()
    const createdCustomer = await Customer.create({
        url: 'https://example.com',
        login_email: 'kjhkjh',
        profile: {
            first_name: 'Elad',
            last_name: 'Kishon'
        },
        status: '',
    })

    const customer = await Customer.findOne({where: {customer_id: createdCustomer.customer_id}})
    console.log(customer.profile)
    console.log(customer.login_email)
}

main().catch(err => {
    console.error('Unable to connect to the database:', err);
})
