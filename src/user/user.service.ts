import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable({})
export class UserService {
    constructor() { }

    async Login(username: string, password: string) {
        try {
            // login throw externalurl
            const externalurl = `http://localhost:4444/api/login`;

            const external_response = await axios.post(externalurl, {
                username,
                password
            })

            return external_response.data;

        } catch (err) {
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}