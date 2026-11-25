import { IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
    @IsNotEmpty({ message: 'El usuario o email es obligatorio' })
    identifier: string; 

    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;
}