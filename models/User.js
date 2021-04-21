const { Model, DataTypes } = require('sequelize')
const sequelize = require('../db.js')

class User extends Model { }
User.init({
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                args: true,
                msg: "Enter Username"
            },
            len: {
                msg: "Username must be btween 3 - 10 characters long",
                args: [3, 10]
            }
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { args: true, msg: "Enter Password" },
            len: {
                msg: "Password must be btween 5 - 15  characters long",
                args: [5, 15]
            }
        }
    },
}, { freezeTableName: true, sequelize, modelName: 'User' });

class Tweet extends Model { }
Tweet.init({
    content: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Write something" }
        }
    },
    timeCreated: DataTypes.DATE,
    creator: DataTypes.STRING,
}, { sequelize, modelName: 'Tweet' });

User.hasMany(Tweet);
Tweet.belongsTo(User);


(async () => {
    sequelize.sync({ force: true })
})()

let models = { User, Tweet }
module.exports = models