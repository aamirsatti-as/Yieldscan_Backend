import { MikroORM } from "@mikro-orm/mongodb";
import runCron from "./cron";
import startServer from "./server";
import MikroOrmConfig from "./mikro-orm-config";

MikroORM.init(MikroOrmConfig).then(async (orm: MikroORM) => {

    runCron(orm);
    startServer(orm);
})
