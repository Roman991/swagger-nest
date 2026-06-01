import {Logger, ValidationPipe} from "@nestjs/common";

import {ContextIdFactory, NestFactory, Reflector} from "@nestjs/core";
import {NestExpressApplication} from "@nestjs/platform-express";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

import {CorsOptions} from "@nestjs/common/interfaces/external/cors-options.interface";

import {AppModule} from "./app.module";

import {writeFile} from "fs";

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // logger: new LoggerService(),
  });

  // await repl(AppModule);

  app.enableShutdownHooks();

  // Increase the payload size limit without registering a second body parser.
  app.useBodyParser("json", {limit: "10mb"});
  app.useBodyParser("urlencoded", {extended: true, limit: "10mb"});

  // const reflector = app.get(Reflector);
  // app.useGlobalGuards(new JwtAuthGuard(reflector));
  // // context factory for durable providers
  // ContextIdFactory.apply(new AggregateByTenantContextIdStrategy());

  // const configService = app.get(ConfigService);

  // VALIDATION
  app.useGlobalPipes(
    new ValidationPipe({
      // whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidUnknownValues: false,
    }),
  );

  // add global prefix
  app.setGlobalPrefix("api");

  // CORS

  let cors: CorsOptions | undefined;

  app.enableCors(cors);

  const logger = new Logger("Main");

  // SWAGGER

  const options = new DocumentBuilder()
    .setTitle("qdl_gateway")
    .setDescription("Gateway for the QdL warehouse management system")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  writeFile("dist/api/swagger.json", JSON.stringify(document), (err) => {
    if (err) {
      logger.error("SWAGGER", err);
    }
  });
  SwaggerModule.setup("docs", app, document);

  await app.listen(8080, "0.0.0.0"); // todo is there a better way to do it for production?

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  // LINKS
  logger.log(`Listening on port 8080, env: ${process.env.NODE_ENV}`);
  logger.debug(`DOCS: http://localhost:8080/docs`);
}
bootstrap();
