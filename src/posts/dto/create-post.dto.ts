import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: 'El contenido no puede estar vacío' })
  @IsString({ message: 'El contenido debe ser texto' })
  contenido: string;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser una URL válida' })
  imagen?: string;
}