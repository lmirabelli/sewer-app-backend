import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: 'El titulo no puede estar vacío' })
  @IsString({ message: 'El titulo debe ser texto' })
  titulo: string;

  @IsNotEmpty({ message: 'El contenido no puede estar vacío' })
  @IsString({ message: 'El contenido debe ser texto' })
  cuerpo: string;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser una URL válida' })
  imagen?: string;
}