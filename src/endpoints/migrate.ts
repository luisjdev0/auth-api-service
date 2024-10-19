import { Request, Response } from "express";
import { executeQuery } from "../helpers";

export const runMigrate = async (req: Request, res: Response) => {
  try {
    const infoDB = `
        DROP DATABASE IF EXISTS ${process.env.DB_NAME};
        CREATE DATABASE ${process.env.DB_NAME};
        USE ${process.env.DB_NAME};
        CREATE TABLE user (
            id INT PRIMARY KEY AUTO_INCREMENT,
            creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            full_name VARCHAR(255),
            username VARCHAR(255) UNIQUE,
            email VARCHAR(255) UNIQUE,
            pwd VARCHAR(80)
        );
        CREATE TABLE api (
            id INT PRIMARY KEY AUTO_INCREMENT,
            creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            api_name VARCHAR(255),
            api_id VARCHAR(255) UNIQUE
        );
        CREATE TABLE user_api (
            id INT PRIMARY KEY AUTO_INCREMENT,
            creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            id_user INT NOT NULL,
            id_api INT NOT NULL,
            expiration_rate VARCHAR(20) DEFAULT NULL,
            enabled BOOLEAN NOT NULL DEFAULT TRUE,
            UNIQUE KEY (id_user, id_api)
        );
        ALTER TABLE user_api ADD FOREIGN KEY (id_user) REFERENCES user(id) ON UPDATE CASCADE ON DELETE CASCADE;
        ALTER TABLE user_api ADD FOREIGN KEY (id_api) REFERENCES api(id)  ON UPDATE CASCADE ON DELETE CASCADE;
    `;
    const result = await executeQuery(infoDB, [], true);

    res.json({
      message: "Database scheme created",
      info: result,
    });

    return;
  } catch (e : any) {
    res.status(500).json({
        status: 500,
        message: e
    })
  }
};
