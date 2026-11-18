import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: true })
export class Comentario {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  usuario: Types.ObjectId;

  @Prop({ required: true })
  texto: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: false })
  editado: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true, trim: true })
  titulo: string;

  @Prop({ required: true, trim: true })
  cuerpo: string;

  @Prop()
  imagen?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId | any;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];

  @Prop({ type: [ComentarioSchema], default: [] })
  comentarios: Types.DocumentArray<Comentario>;
}

export const PostSchema = SchemaFactory.createForClass(Post);