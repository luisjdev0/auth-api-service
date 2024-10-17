import express from "express";
import dotenv from "dotenv";
import joi from "joi";
import { query } from "./helpers";

dotenv.config();

const app = express();

app.use(express.json())

app.post("/", async (req, res) => {
  const scheme = joi.object({
    email: joi.string().email().required(),
    pwd: joi.string().required(),
    id_api: joi.string().required(),
  })

  const validation = scheme.validate(req.body);
  if (validation.error) {
    res.status(400).json({
      status: 400,
      params: req.body ?? req.query,
      errors: validation.error.message
    });
    return
  }

  const { email, pwd, id_api } = validation.value

  const result = await query('SELECT * FROM user_api A JOIN user B ON A.ID_USER = B.ID JOIN api C ON A.ID_API = C.ID WHERE B.EMAIL = ? AND C.API_ID = ?', [
    email, id_api
  ])

  res.json({
    message: "Bienvenido",
    result
  });
});

app.get("*", (req, res) => {
  res.status(400).json({
    status: 400,
    params: req.body ?? req.query,
    message: `${req.method} ${req.url} Not exists`,
  });
});

app.listen(process.env.SERVER_PORT, () => {
  console.log(
    `Servidor levantado en http://127.0.0.1:${process.env.SERVER_PORT}`
  );
});
