import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import axios from "axios";
import * as dotenv from 'dotenv';
 
dotenv.config();

@Injectable({})
export class DoctorService {
    constructor() { }

    async GetDoctorList(empcode: string) {
        try {
            // Fetch doctor list from external api
            const externalAPI = `${process.env.EXTERNAL_URL}/doctorlist?empCode=${empcode}`;

            const external_response = await axios.get(externalAPI);

            const doctors = external_response.data;

            const doctorList = doctors.doctors;

            if (!doctorList || !Array.isArray(doctorList) || !external_response) {
                throw new HttpException("Invalid response from external API", HttpStatus.BAD_GATEWAY);
            }

            return {
                status: "success",
                doctorList
            }
        } catch (err) {
            if (err.response) {
                console.error('Error status:', err.response.status);
                console.error('Error data:', err.response.data);
        
                // Bubble up microservice error
                throw new HttpException(
                    err.response.data?.message || 'External service error',
                    err.response.status
                );
            }
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async GetDoctorDetails(drCode: string) {
        try {
            console.log(drCode);
            // Doctor Details from external API
            const external_doc_api = `${process.env.EXTERNAL_URL}/drdetails?drcode=${drCode}`;
            const response = await axios.get(external_doc_api);

            return response?.data?.doctor;

        } catch (err) {
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

}