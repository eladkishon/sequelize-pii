import {Sequelize} from "sequelize";

const sequelize = new Sequelize({database: 'test', dialect: 'mysql', username: 'root', password: 'my-secret-pw' })
export default sequelize;
