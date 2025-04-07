import { Module } from "@nestjs/common";
import { TestController } from "./test.controller";
import { TestService } from "./test.service";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([])],
    controllers: [TestController],
    providers: [TestService],
    exports: [],
})

export class TestModule { }