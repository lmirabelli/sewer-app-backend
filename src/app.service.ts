import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '¡Backend de la Red Social activo y conectado a MongoDB Atlas!';
  }
}