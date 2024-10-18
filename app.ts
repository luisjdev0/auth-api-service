import express, { Request, Response, NextFunction } from "express";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import { authMiddleware } from "./helpers";
import { authEndpoint } from "./endpoints/auth";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "./endpoints/users";
import { runMigrate } from "./endpoints/migrate";
import { createApi, deleteApi, getApis, updateApi } from "./endpoints/apis";
import { authorizeApi, revokeApi } from "./endpoints/permissions";

dotenv.config();

const app = express();

app.use(cors());
app.use(compression());
app.use(express.json());

app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ status: 400, mensaje: "Invalid JSON" });
    return;
  }
  next();
});

app.post("/", authEndpoint);

app.get("/users", authMiddleware, getUsers);
app.post("/users", authMiddleware, createUser);
app.patch("/users/:id", authMiddleware, updateUser);
app.delete("/users/:id", authMiddleware, deleteUser);

app.post("/migrate", authMiddleware, runMigrate);

app.get("/apis", authMiddleware, getApis)
app.post("/apis", authMiddleware, createApi)

app.patch('/apis/:id', authMiddleware, updateApi)
app.delete('/apis/:id', authMiddleware, deleteApi)

app.post('/authorize', authMiddleware, authorizeApi)
app.post('/revoke', authMiddleware, revokeApi)

app.all("*", (req, res) => {
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
