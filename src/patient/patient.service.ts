import { Injectable } from "@nestjs/common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
@Injectable({})
export class PatientService {
    constructor () {}

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

    // async uploadToS3(image: Express.Multer.File): Promise<string> {
    //     try {
    //         const { buffer, mimetype } = image;
    //         console.log("buffer", buffer);

    //         const fileExtension = image.originalname.split('.').pop();

    //         const signedURL = await this.getPresignedURL({
    //             file_name: `patientfeedback${Date.now()}.${fileExtension}`,
    //         });

    //         const s3Response = await fetch(signedURL, {
    //             method: 'PUT',
    //             body: buffer,
    //             headers: {
    //                 'Content-Type': `${mimetype}`,
    //             },
    //             redirect: 'follow',
    //         });

    //         if (s3Response) {
    //             const image_url: string = s3Response?.url.split('?')[0];
    //             return image_url;
    //         }
    //         // return s3Response
    //     } catch (error: any) {
    //         throw error;
    //     }
    // }
}