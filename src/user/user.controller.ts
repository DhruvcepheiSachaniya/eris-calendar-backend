import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller('api/user')
export class UserController {
    constructor (
        private userService: UserService
    ) {}

    //summary data, user profile, upload user image,
    @Post('login')
    async Login (
        @Body('username') username: string,
        @Body('password') password: string
    ) {
        return this.userService.Login(username, password);
    }
}