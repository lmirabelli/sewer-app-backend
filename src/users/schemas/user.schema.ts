import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, trim: true })
  apellido: string;

  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fechaNacimiento: string;

  @Prop({ default: '' })
  descripcionBreve: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: 'usuario', enum: ['usuario', 'administrador'] })
  perfil: string;
}

export const UserSchema = SchemaFactory.createForClass(User);