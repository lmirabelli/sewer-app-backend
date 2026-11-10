import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @IsString({ message: 'El comentario debe ser texto' })
  texto: string;
}