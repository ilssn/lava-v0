"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type, Accept, Authorization',
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'), {
        prefix: '/static',
    });
    await app.listen(process.env.SERVER_PORT);
    console.log(`Server is running on port ${process.env.SERVER_PORT}`);
}
bootstrap();
//# sourceMappingURL=main.js.map