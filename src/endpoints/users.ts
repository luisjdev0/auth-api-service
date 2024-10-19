import { Request, Response } from "express";
import { executeQuery, passwordHash } from "../helpers";
import { QueryError } from "mysql2/promise";
import Joi from "joi";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await executeQuery(
      "SELECT id, creation_date, full_name, username, email FROM user"
    );
    res.json(users);
  } catch (e: any) {
    res.status(500).json({
      status: 500,
      message: e,
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const validator = Joi.object({
    full_name: Joi.string().max(255).required(),
    username: Joi.string().trim().pattern(/^\S+$/).max(255).required(),
    email: Joi.string().email().max(255).required(),
    pwd: Joi.string().required(),
  });

  const data: Joi.ValidationResult = validator.validate(req.body);

  if (data.error) {
    res.status(400).json({
      status: 400,
      message: data.error.message,
    });
    return;
  }

  const { full_name, username, email, pwd } = data.value;

  try {
    const query = await executeQuery(
      "INSERT INTO user (full_name, username, email, pwd) VALUES (?, ?, ?, ?)",
      [full_name, username, email, await passwordHash(pwd)]
    );

    res.status(201).json({
      message: "User created successfuly",
      id: (query as any).insertId,
    });
  } catch (e) {
    const error = e as QueryError;
    res.status(400).json({
      status: 400,
      message:
        error.code == "ER_DUP_ENTRY"
          ? "Email or username already in use"
          : error.message,
    });
  }

  return;
};

export const updateUser = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.status(400).json({
      status: 400,
      message: "User ID must be specified",
    });
    return;
  }

  const validator = Joi.object({
    full_name: Joi.string().max(255).optional(),
    username: Joi.string().trim().pattern(/^\S+$/).max(255).optional(),
    email: Joi.string().email().max(255).optional(),
    pwd: Joi.string().optional(),
  });

  const data: Joi.ValidationResult = await validator.validate(req.body);
  //console.log(data)

  if (data.error) {
    res.status(400).json({
      status: 400,
      message: data.error.message,
    });
    return;
  }

  try {
    await executeQuery(
      `UPDATE user SET ${Object.keys(data.value).map(
        (e) => `${e} = ?`
      )} WHERE id = ?`,
      [
        ...(await Promise.all(
          Object.keys(data.value).map(async (e) =>
            e == "pwd" ? await passwordHash(data.value[e]) : data.value[e]
          )
        )),
        req.params.id,
      ]
    );

    res.json({
      message: `User with ID "${req.params.id}" has been updated`,
    });

    return;
  } catch (e) {
    const error = e as QueryError;
    res.status(400).json({
      status: 400,
      message:
        error.code == "ER_DUP_ENTRY"
          ? "Email or username already in use"
          : error.message,
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.status(400).json({
      status: 400,
      message: "User ID must be specified",
    });
    return;
  }

  try {
    await executeQuery("DELETE FROM user WHERE id = ?", [req.params.id]);

    res.json({
      message: `User with ID "${req.params.id}" has been deleted`,
    });
  } catch (e: any) {
    res.status(500).json({
      status: 500,
      message: e,
    });
  }

  return;
};
