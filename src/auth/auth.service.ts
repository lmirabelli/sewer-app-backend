import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/schemas/user.schema.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const { nombre, apellido, username, email, password, fechaNacimiento, avatar } = registerDto;

        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new BadRequestException('El correo electrónico ya está registrado');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new this.userModel({
            nombre,
            apellido,
            username,
            email,
            password: hashedPassword,
            fechaNacimiento,
            avatar: avatar || null,
        });

        await newUser.save();

        return {
            mensaje: 'Usuario registrado exitosamente',
            usuario: { id: newUser._id, nombre: newUser.nombre, email: newUser.email, username: newUser.username },
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('El e-mail no existe en esta cloaca');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Le erraste a la contraseña, intentalo otra vez');
        }

        const payload = { 
            sub: user._id, 
            email: user.email, 
            perfil: user.perfil
        };
        
        const token = this.jwtService.sign(payload);

        return {
            mensaje: 'Login exitoso',
            access_token: token,
            usuario: { 
                id: user._id, 
                nombre: user.nombre, 
                email: user.email, 
                perfil: user.perfil
            },
        };
    }
}