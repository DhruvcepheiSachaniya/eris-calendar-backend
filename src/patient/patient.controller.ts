import { Body, Controller, Get, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { PatientService } from "./patient.service";
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { AddPatientDto } from "./dto/addpatient.dto";
import { EditPatientDto } from "./dto/editpatient.dto";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";

@Controller('api/patient')
export class PatientController {
    constructor(
        private patientService: PatientService
    ) { }

    //add patient, edit patient, patient terms and condition, view patient
    // @UseGuards(JwtAuthGuard)
    @Post('add')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'pre_img', maxCount: 1 },
        { name: 'rep_img', maxCount: 1 }
      ]
    ))
    async AddPatient(
        @Body() dto: AddPatientDto,
        @UploadedFiles() files: { pre_img?: Express.Multer.File[]; rep_img?: Express.Multer.File[] }
    ) {
        const pre_img = files.pre_img?.[0];
        const rep_img = files.rep_img?.[0];

        const pre_url = await this.patientService.uploadToS3(pre_img);
        const rep_url = await this.patientService.uploadToS3(rep_img);

        return this.patientService.AddPatient(dto, rep_url, pre_url)
    }

    // Edit Details, get patient details, based doctor details
    // @UseGuards(JwtAuthGuard)
    @Post('edit')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'pre_img', maxCount: 1 },
        { name: 'rep_img', maxCount: 1 }
    ]))
    async EditPatient(
        @Body() dto: EditPatientDto,
        @UploadedFiles() files: { pre_img?: Express.Multer.File[]; rep_img?: Express.Multer.File[] }
    ) {
        const pre_img = files.pre_img[0];
        const rep_img = files.rep_img[0];
        let pre_url;
        let rep_url;
        if (pre_img) {
            pre_url = await this.patientService.uploadToS3(pre_img);
        }
        if (rep_img) {
            rep_url = await this.patientService.uploadToS3(rep_img);
        }
        return this.patientService.EditPatient(dto, pre_url, rep_url);
    }

    // @UseGuards(JwtAuthGuard)
    @Get('details')
    async GetPatientDetails(@Query('patientcode') patientcode: string) {
        return this.patientService.ViewPatientDetails(patientcode);
    }
}