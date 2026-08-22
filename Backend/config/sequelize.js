import { Sequelize } from 'sequelize';

const mysqlUri = process.env.MYSQL_URI || 
  (process.env.MYSQL_HOST 
    ? `mysql://${process.env.MYSQL_USER || 'root'}:${process.env.MYSQL_PASSWORD || ''}@${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT || 3306}/${process.env.MYSQL_DATABASE || 'docconnect'}`
    : 'mysql://root:@localhost:3306/docconnect');

const extraConfig = {};
if (mysqlUri.includes('aivencloud') || mysqlUri.includes('acloud') || mysqlUri.includes('render')) {
  extraConfig.dialectOptions = {
    ssl: {
      rejectUnauthorized: false
    }
  };
}

const sequelize = new Sequelize(mysqlUri, {
  dialect: 'mysql',
  logging: false,
  define: {
    timestamps: false
  },
  ...extraConfig
});

export default sequelize;
