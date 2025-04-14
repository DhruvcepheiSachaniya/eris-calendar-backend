import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable({})
export class DoctorService {
    constructor() { }

    async GetDoctorList(empcode: string) {
        try {
            // Fetch doctor list from external api
            const externalAPI = `http://localhost:4444/api/doctorlist?empCode=${empcode}`;

            const external_response = await axios.get(externalAPI);

            const doctorList = external_response.data;

            if (!doctorList || !Array.isArray(doctorList.drList) || !external_response) {
                throw new HttpException("Invalid response from external API", HttpStatus.BAD_GATEWAY);
            }

            return {
                status: "success",
                doctorList
            }
        } catch (err) {
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}