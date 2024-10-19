import { Request, Response } from "express";
import { executeQuery } from "../helpers";
import Joi from "joi";
import { QueryError } from "mysql2/promise";

export const getApis = async (req: Request, res: Response) => {
  try {
    const users = await executeQuery("SELECT * FROM api");
    res.json(users);
  } catch (e: any) {
    res.status(500).json({
      status: 500,
      message: e,
    });
  }
};

export const createApi = async (req: Request, res: Response) => {
  const validator = Joi.object({
    api_name: Joi.string().max(255).required(),
    api_id: Joi.string().trim().pattern(/^\S+$/).max(255).required(),
  });

  const data: Joi.ValidationResult = validator.validate(req.body);

  if (data.error) {
    res.status(400).json({
      status: 400,
      message: data.error.message,
    });
    return;
  }

  const { api_name, api_id } = data.value;

  try {
    const query = await executeQuery(
      "INSERT INTO api (api_name, api_id) VALUES (?, ?)",
      [api_name, api_id]
    );

    res.status(201).json({
      message: "Api created successfuly",
      id: (query as any).insertId,
    });
  } catch (e) {
    const error = e as QueryError;
    res.status(400).json({
      status: 400,
      message:
        error.code == "ER_DUP_ENTRY" ? "API_ID already in use" : error.message,
    });
  }
};

export const updateApi = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.status(400).json({
      status: 400,
      message: "User ID must be specified",
    });
    return;
  }

  const validator = Joi.object({
    api_name: Joi.string().max(255).required(),
    api_id: Joi.string().trim().pattern(/^\S+$/).max(255).required(),
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
      `UPDATE api SET ${Object.keys(data.value).map(
        (e) => `${e} = ?`
      )} WHERE id = ?`,
      [
        ...(await Promise.all(
          Object.keys(data.value).map(async (e) => data.value[e])
        )),
        req.params.id,
      ]
    );

    res.json({
      message: `API with ID "${req.params.id}" has been updated`,
    });

    return;
  } catch (e) {
    const error = e as QueryError;
    res.status(400).json({
      status: 400,
      message:
        error.code == "ER_DUP_ENTRY" ? "API_ID already in use" : error.message,
    });
  }
};

export const deleteApi = async (req: Request, res: Response) => {
  if (!req.params.id) {
    res.status(400).json({
      status: 400,
      message: "User ID must be specified",
    });
    return;
  }

  try {
    await executeQuery("DELETE FROM api WHERE id = ?", [req.params.id]);

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
