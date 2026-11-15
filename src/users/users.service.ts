import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
}