import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AddPatientDto } from "./dto/addpatient.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Patient_master_entity } from "src/entity/patient_master.entity";
import { Repository } from "typeorm";
import { Session } from "src/entity/session.entity";
import { EditPatientDto } from "./dto/editpatient.dto";
@Injectable({})
export class PatientService {
    constructor(
        @InjectRepository(Patient_master_entity)
        private readonly patientRepository: Repository<Patient_master_entity>,
        @InjectRepository(Session)
        private readonly sessionRepository: Repository<Session>
    ) { }

    async getPresignedURL(presignedData: any): Promise<string> {
        try {
            // will add all credentials later.
            const client = new S3Client({
                region: process.env.AWS_REGION,

                credentials: {
                    accessKeyId: process.env.AWS_KEY,
                    secretAccessKey: process.env.AWS_SECRET_KEY,
                }
            });

            const command = new PutObjectCommand({
                Key: presignedData.file_name,
                Bucket: process.env.S3_BUCKET_NAME,
            }

            );
            return getSignedUrl(client, command, {
                expiresIn: 3600,
            });
        } catch (err) {
            throw err;
        }
    }

    async uploadToS3(image: Express.Multer.File): Promise<string> {
        try {
            const { buffer, mimetype } = image;
            console.log("buffer", buffer);

            const fileExtension = image.originalname.split('.').pop();

            const signedURL = await this.getPresignedURL({
                file_name: `eris-calendar${Date.now()}.${fileExtension}`,
            });

            const s3Response = await fetch(signedURL, {
                method: 'PUT',
                body: buffer,
                headers: {
                    'Content-Type': `${mimetype}`,
                },
                redirect: 'follow',
            });

            if (s3Response) {
                const image_url: string = s3Response?.url.split('?')[0];
                return image_url;
            }
            // return s3Response
        } catch (error: any) {
            throw error;
        }
    }

    async AddPatient(dto: AddPatientDto, pre_url: string, rep_url: string) {
        return await this.patientRepository.manager.transaction(async (manager) => {
            // 1. Check patient code uniqueness
            const existingPatient = await manager.findOne(Patient_master_entity, {
                where: { patient_code: dto.patientcode }
            });
            if (existingPatient) {
                throw new HttpException("Patient code already exists", HttpStatus.BAD_REQUEST);
            }
    
            // 2. Verify session exists and is valid
            const session = await manager.findOne(Session, {
                where: { id: dto.sessionid },
            });
            if (!session) {
                throw new HttpException("Session not found", HttpStatus.NOT_FOUND);
            }
    
            // 3. Create new patient
            const newPatient = manager.create(Patient_master_entity, {
                patient_code: dto.patientcode,
                patient_name: dto.name,
                patient_age: dto.age,
                patient_gender: dto.gender,
                prescription_img: pre_url,
                report_img: rep_url,
                dr_Code: dto.drcode,
                sessions: [session] // This is correct for ManyToOne
            });
    
            // 4. Save and update relationships
            await manager.save(newPatient);
    
            return {
                status: "success",
                data: {
                    patientId: newPatient.id,
                    sessionInfo: {
                        id: session.id,
                        timeSlot: `${session.start_time.toISOString()} - ${session.end_time.toISOString()}`
                    }
                }
            };
        });
    }

    async EditPatient(dto: EditPatientDto,  pre_url?: string, rep_url?: string) {
        try {
            // first find patient
            const find_patient = await this.patientRepository.findOne({
                where: {
                    patient_code: dto.patientcode
                }
            });

            if (!find_patient) {
                throw new HttpException("Patient not found", HttpStatus.NOT_FOUND);
            }

            // update patient
            if (dto.name) find_patient.patient_name = dto.name;
            if (dto.age) find_patient.patient_age = dto.age;
            if (dto.gender) find_patient.patient_gender = dto.gender;
            if (pre_url) find_patient.prescription_img = pre_url;
            if (rep_url) find_patient.report_img = rep_url;

            await this.patientRepository.save(find_patient);

            return {
                message: "Patient updated successfully",
                patient: {
                    id: find_patient.id,
                    name: find_patient.patient_name,
                    age: find_patient.patient_age,
                    gender: find_patient.patient_gender,
                    prescription_img: find_patient.prescription_img,
                    report_img: find_patient.report_img
                }
            }
            //
        } catch (err) {
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async ViewPatientDetails(patientcode: string) {
        try {
            const find_patient = await this.patientRepository.findOne({
                where: {
                    patient_code: patientcode
                }
            });

            if (!find_patient) {
                throw new HttpException("Patient not found", HttpStatus.NOT_FOUND);
            }

            return {
                message: "Patient details",
                patient: {
                    id: find_patient.id,
                    name: find_patient.patient_name,
                    age: find_patient.patient_age,
                    gender: find_patient.patient_gender,
                    prescription_img: find_patient.prescription_img,
                    report_img: find_patient.report_img
                }
            }
        } catch (err) {
            throw new HttpException(
                err instanceof HttpException ? err.getResponse() : "Internal Server Error",
                err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
            );
        }   
    }
}