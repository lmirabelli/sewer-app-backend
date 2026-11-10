import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'El avatar debe ser una URL válida' })
  avatar?: string;

  @IsOptional()
  @IsString({ message: 'La biografía debe ser un texto' })
  biografia?: string;
}