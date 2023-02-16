import { main } from "./main";

main({
  type: "sqlite",
  database: "databases/data.db",
  entities: ["src/entity/**/*.js"],
  synchronize: true,
}).catch(console.error);
