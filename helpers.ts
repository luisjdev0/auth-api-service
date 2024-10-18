import mysql, { QueryError } from "mysql2/promise";
import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";

export const executeQuery = async (
  sql: string,
  params?: Array<any>,
  multiquery: boolean = false
) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PWD,
      database: process.env.DB_NAME,
      multipleStatements: multiquery,
    });

    let data;

    if (multiquery) {
      data = (await connection.query(sql, params))[0];
    } else {
      data = (await connection.execute(sql, params))[0];
    }
    connection.end();
    return data;
  } catch (e) {
    throw e as QueryError;
  }
};

export const passwordHash = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const passwordVerify = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    req.headers.authorization != null &&
    req.headers.authorization == `Bearer ${process.env.AUTH_SECRET_TOKEN}`
  ) {
    next();
    return;
  }
  res.status(401).json({
    status: 401,
    message: "Invalid credentials in authorization header",
  });
  return;
};

export const getApiIdByCustomSlug = async (slug: string) => {
  return (
    (await executeQuery("SELECT id FROM api WHERE api_id = ?", [slug])) as any
  )[0]["id"];
};
export const getUserIdByUsername = async (username: string) => {
  return (
    (await executeQuery(
      "SELECT id FROM user WHERE username = ? or email = ? LIMIT 1",
      [username, username]
    )) as any
  )[0]["id"];
};
