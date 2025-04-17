import { Controller, Get, Query } from "@nestjs/common";
import { DoctorService } from "./doctor.service";

@Controller('api/doctor')
export class DoctorController {
    constructor (
        private doctorService: DoctorService,
    ) {}

    //doctor video upload, doctor video list, doctor details,   

    @Get('doctorlist')
    async getDoctorList(
        @Query('empCode') empCode: string,
    ) {
        return this.doctorService.GetDoctorList(empCode);
    }

    @Get('doctordetails')
    async getDoctorDetails(
        @Query('drcode') drcode: string,
    ) {
        return this.doctorService.GetDoctorDetails(drcode);
    }
}