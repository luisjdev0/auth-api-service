import Joi from "joi";
import { Request, Response } from "express";
import {
  executeQuery,
  getApiIdByCustomSlug,
  getUserIdByUsername,
} from "../helpers";
import { QueryError } from "mysql2/promise";

export const authorizeApi = async (req: Request, res: Response) => {
  const validator = Joi.object({
    username: Joi.string().trim().pattern(/^\S+$/).max(255).required(),
    api_id: Joi.string().trim().pattern(/^\S+$/).max(255).required(),
    expiration_rate: Joi.string().trim().max(20).optional().default(null),
  });

  const data: Joi.ValidationResult = validator.validate(req.body);

  if (data.error) {
    res.status(400).json({
      status: 400,
      message: data.error.message,
    });
    return;
  }

  const { username, api_id, expiration_rate } = data.value;

  try {
    const query = await executeQuery(
      "INSERT INTO user_api (id_user, id_api, expiration_rate) VALUES (?, ?, ?)",
      [
        await getUserIdByUsername(username),
        await getApiIdByCustomSlug(api_id),
        expiration_rate,
      ]
    );

    res.status(201).json({
      message: "API authorized successfuly",
      id: (query as any).insertId,
    });
  } catch (e) {
    const error = e as QueryError;
    res.status(400).json({
      status: 400,
      message:
        error.code == "ER_DUP_ENTRY"
          ? "API already authorized"
          : "Invalid Username or API ID",
    });
  }
};

export const revokeApi = async (req: Request, res: Response) => {
  const validator = Joi.object({
    username: Joi.string().trim().pattern(/^\S+$/).max(255).required(),
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

  const { username, api_id } = data.value;

  try {
    const query = await executeQuery(
      "DELETE FROM user_api WHERE id_user = ? and id_api = ?",
      [await getUserIdByUsername(username), await getApiIdByCustomSlug(api_id)]
    );

    res.status(201).json({
      message: "API revoked",
    });
  } catch (e) {
    const error = e as QueryError;
    res.status(400).json({
      status: 400,
      message:
        error.code == "ER_DUP_ENTRY"
          ? "API already revoked"
          : "Invalid Username or API ID",
    });
  }
};
