

# sequelize-pii

<!-- ABOUT THE PROJECT -->
## About 


In many cases some models in your database will have private identifiable information (PII).
For example, a user's email address, name, address etc.

Sequelize is missing support of defining part of the fields of your
model as PII data, and consequently encrypting them in the database, while still maintaining a convenient declarative syntax.



<!-- GETTING STARTED -->
## Getting Started


### Installation

```bash
npm install sequelize-pii
```


<!-- USAGE EXAMPLES -->
## Usage

In the example, we want define a model Customer, that contains sensitive data like profile that contains the customer name 
and the login_email. We want to write this model as we normally would using Sequelize, but this time Customer would
inherit from `PersonalDataModel` rather than `Model`. Another step required to make this complete is at add
the `@PIIProtectedClass` decorator to the `Customer` model, and passing the `encryptiongKey` that'll be used to encrypt
and decrypt the PII-marked
fields. 
We mark the fields as PII by adding the `@PIIProtectedField` decorator.

```ts
@PIIProtectedClass({enableSearch: true, encryptionKey: PII_KEY})
export class Customer extends PersonalDataModel<InferAttributes<Customer>, InferCreationAttributes<Customer>> {
    declare id: number;
    declare customer_id: string;
    declare url: string;
    @PIIProtectedField({searchable: true})
    declare login_email: string;
    @PIIProtectedField({searchable: ['first_name']})
    declare profile: {
        first_name: string;
        last_name: string;
    };
    declare status: string;
}

// instead of normal Model.init() we should call initWithProtection()
Customer.initWithProtection(
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
            url: {
                type: DataTypes.STRING,
            },
            status: DataTypes.STRING,
        },
            {
            sequelize: sequelize,
            }
    );
```

