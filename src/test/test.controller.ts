import { Controller, Get } from "@nestjs/common";

@Controller('api')
export class TestController {
    constructor () {}

    @Get('test')
    async Gettest() {
        return 'test';
    }
}