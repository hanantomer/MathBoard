"use strict";
const { Model, INTEGER } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Answer extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Answer.belongsTo(models.Question, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },   
            });
            Answer.belongsTo(models.User, {
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                foreignKey: { allowNull: false },
            });
        }
    }

    Answer.init(
        {
            uuid: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
            },
            status: {
                type: DataTypes.STRING,
                defaultValue: "DRAFT",  //DRAFT, APPROVED, CHECKED
            },
            score: {
                type: DataTypes.INTEGER,
            }
        },
        {
            sequelize,
            freezeTableName: true,
            indexes: [
                {
                    unique: true,
                    fields: ["uuid"],
                },
                {
                    unique: true,
                    fields: ["QuestionId", "UserId"],
                },
            ],
            defaultScope: {
                include: [
                    { model: sequelize.models["User"] },
                    {
                        model: sequelize.models["Question"],
                        attributes: {
                            include: [{
                                model: sequelize.models["Lesson"],
                                attributes: {
                                    exclude: ["id"]
                                }
                            }]
                        },
                    }],
                exclude: ["id", "QuestionId"]
            },
        }
    );

    return Answer;
};
