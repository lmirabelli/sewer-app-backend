import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
    uploadImage(file: Express.Multer.File): Promise<any> {
        console.log('--- INICIANDO SUBIDA A CLOUDINARY ---');
        console.log('Nombre del archivo:', file?.originalname);
        console.log('Tamaño en bytes:', file?.size);
        console.log('¿Tiene buffer?:', !!file?.buffer);

        if (!file || !file.buffer) {
            return Promise.reject(new Error('No se encontró el buffer del archivo en memoria. Verificá que uses memoryStorage.'));
        }

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'sewer-app-posts', timeout: 120000 },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error('Error al subir la imagen a Cloudinary'));
                    resolve(result);
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }
}