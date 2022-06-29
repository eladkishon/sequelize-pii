

# sequelize-pii

<!-- ABOUT THE PROJECT -->
## About 


In many cases some models in your database will have private identifiable information.
For example, a user's email address, name, address etc.

Sequelize is missing a good support of defining some fields of your
project as PII while maintaining a convenient declarative syntax.

<p align="right">(<a href="#top">back to top</a>)</p>




<!-- GETTING STARTED -->
## Getting Started


### Installation

```bash
npm install sequelize-pii
```


<!-- USAGE EXAMPLES -->
## Usage

```ts
@PIIClass({enableSearch: true, encryptionKey: PII_KEY})
export class Customer extends PersonalDataModel<InferAttributes<Customer>, InferCreationAttributes<Customer>> {
    declare id: number;
    declare customer_id: string;
    declare url: string;
    @PIIField({searchable: true})
    declare login_email: string;
    @PIIField({searchable: ['first_name']})
    declare profile: {
        first_name: string;
        last_name: string;
    };
    declare status: string;
}

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

