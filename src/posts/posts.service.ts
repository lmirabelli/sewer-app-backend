import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './schemas/post.schema.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async create(createPostDto: CreatePostDto, userId: string) {
    return this.postModel.create({
      ...createPostDto,
      autor: new Types.ObjectId(userId),
    });
  }

  async findAll(query: { orden?: string; usuarioId?: string; limit?: string; offset?: string }) {
    const filtros: any = {};

    if (query.usuarioId) {
      filtros.autor = new Types.ObjectId(query.usuarioId);
    }

    let consulta = this.postModel
      .find(filtros)
      .populate('autor', 'username email avatar')
      .populate('comentarios.usuario', 'username email avatar');

    if (query.orden === 'likes') {
      consulta = consulta.sort({ likes: -1, createdAt: -1 });
    } else {
      consulta = consulta.sort({ createdAt: -1 });
    }

    if (query.offset) {
      consulta = consulta.skip(parseInt(query.offset, 10) || 0);
    }
    
    if (query.limit) {
      consulta = consulta.limit(parseInt(query.limit, 10) || 10);
    }

    return consulta.exec();
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    const userObjectId = new Types.ObjectId(userId);
    const index = post.likes.findIndex((id) => id.equals(userObjectId));

    if (index === -1) {
      post.likes.push(userObjectId);
    } else {
      post.likes.splice(index, 1);
    }

    return post.save();
  }

  async addComment(postId: string, createCommentDto: CreateCommentDto, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    post.comentarios.push({
      usuario: new Types.ObjectId(userId),
      texto: createCommentDto.texto,
      createdAt: new Date(),
    });

    return post.save();
  }

  async remove(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    if (post.autor.toString() !== userId) {
      throw new NotFoundException('No tenés permisos para eliminar este post');
    }

    return this.postModel.findByIdAndDelete(postId);
  }
}