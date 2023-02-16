import { RouteHandlerMethod } from "fastify";
import * as argon2 from "@node-rs/argon2";
import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { jwtGenerator } from "../../main";

export const registerHandler: RouteHandlerMethod = async (request, _reply) => {
  const body = request.body as {
    name: string;
    password: string;
  };

  const hash = await argon2.hash(body.password, {
    algorithm: argon2.Algorithm.Argon2id,
  });

  const user = new User();
  user.name = body.name;
  user.hash = hash;

  await AppDataSource.manager.save(user);
};

export const loginHandler: RouteHandlerMethod = async (request, reply) => {
  const body = request.body as {
    name: string;
    password: string;
  };

  const user = await AppDataSource.manager.findOneBy(User, { name: body.name });
  if (user === null) {
    throw Error("user does not exist");
  }

  if (await argon2.verify(user.hash, body.password)) {
    const token = jwtGenerator.create(user.id);
    reply.send({ token: token });
  }

  throw Error("login failed");
};
