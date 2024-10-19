import joi from "joi";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { executeQuery, passwordVerify } from "../helpers";

export const authEndpoint = async (req: Request, res: Response) => {
  const scheme = joi.object({
    email: joi.string().email().required(),
    pwd: joi.string().required(),
    id_api: joi.string().required(),
  });

  const validation = scheme.validate(req.body);
  if (validation.error) {
    res.status(400).json({
      status: 400,
      params: req.body ?? req.query,
      errors: validation.error.message,
    });
    return;
  }

  const { email, pwd, id_api } = validation.value;

  try {
    const result = await executeQuery(
      "SELECT * FROM user_api A JOIN user B ON A.id_user = B.id JOIN api C ON A.id_api = C.id WHERE B.email = ? AND OR B.user = ? AND C.api_id = ? AND enabled=1 ORDER BY B.id",
      [email, email, id_api]
    );

    const user_data = (result as Array<any>)[0];

    if (user_data) {
      const {
        pwd: user_password,
        expiration_rate,
        username,
        email,
        api_id,
      } = user_data;

      if (await passwordVerify(pwd, user_password)) {
        res.json({
          expiration_rate,
          token: jwt.sign(
            {
              username,
              email,
              api_id,
            },
            process.env.JWT_SECRET_KEY as string,
            expiration_rate != null ? { expiresIn: expiration_rate } : {}
          ),
        });

        return;
      }
    }

    res.status(403).json({
      status: 403,
      message: "Invalid user, password or API ID",
    });
  } catch (e: any) {
    res.status(500).json({
      status: 500,
      message: e,
    });
  }
};
