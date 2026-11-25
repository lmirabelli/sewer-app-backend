import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findById(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!updateUserDto.passwordActual) {
      throw new BadRequestException('Debes ingresar tu contraseña actual para confirmar los cambios.');
    }

    const isPasswordValid = await bcrypt.compare(
      updateUserDto.passwordActual,
      user.password
    );

    if (!isPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta.');
    }

    if (updateUserDto.passwordNueva && updateUserDto.passwordNueva.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateUserDto.passwordNueva, salt);
    }

    if (updateUserDto.nombre !== undefined) user.nombre = updateUserDto.nombre;
    if (updateUserDto.apellido !== undefined) user.apellido = updateUserDto.apellido;
    if (updateUserDto.username !== undefined) user.username = updateUserDto.username;

    await user.save();

    const updatedUser = await this.userModel.findById(userId).select('-password');

    return {
      mensaje: 'Perfil actualizado exitosamente',
      usuario: updatedUser,
    };
  }

async findAll() {
    return this.userModel.find().select('-password').sort({ createdAt: -1 }).exec();
  }

  async create(createUserDto: any) {
    const { email, username, password, nombre, apellido, perfil } = createUserDto;

    const existe = await this.userModel.findOne({ $or: [{ email }, { username }] });
    if (existe) throw new ConflictException('El email o nombre de usuario ya está en uso');

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultAvatar = 'https://res.cloudinary.com/zft2yvop/image/upload/v1794969924/sewer-app.png';

    const nuevoUsuario = new this.userModel({
      nombre,
      apellido,
      username,
      email,
      password: hashedPassword,
      fechaNacimiento: createUserDto.fechaNacimiento || '2000-01-01',
      perfil: perfil || 'usuario',
      avatar: defaultAvatar,
      habilitado: true
    });

    await nuevoUsuario.save();
    const userSaved = nuevoUsuario.toObject();
    delete (userSaved as any).password;
    return userSaved;
  }

  async toggleEstado(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.habilitado = !user.habilitado;
    await user.save();

    return { mensaje: `Usuario ${user.habilitado ? 'habilitado' : 'deshabilitado'} correctamente`, habilitado: user.habilitado };
  }
}