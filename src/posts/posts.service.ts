import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './schemas/post.schema.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) { }

  async create(createPostDto: CreatePostDto, userId: string) {
    const nuevoPost = new this.postModel({
      ...createPostDto,
      autor: new Types.ObjectId(userId),
    });

    const postGuardado = await nuevoPost.save();

    return this.postModel
      .findById(postGuardado._id)
      .populate('autor', 'username email avatar')
      .exec();
  }

  async findAll(query: { orden?: string; usuarioId?: string; limit?: string; offset?: string }) {
    const filtros: any = {};

    if (query.usuarioId) {
      filtros.autor = new Types.ObjectId(query.usuarioId);
    }

    const offset = parseInt(query.offset || '0', 10);
    const limit = parseInt(query.limit || '10', 10);

    if (query.orden === 'likes') {
      const sortedDocs = await this.postModel.aggregate([
        { $match: filtros },
        { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
        { $sort: { likesCount: -1, createdAt: -1 } },
        { $skip: offset },
        { $limit: limit },
        { $project: { _id: 1 } }
      ]);

      const ids = sortedDocs.map(d => d._id);
      if (ids.length === 0) return [];

      const posts = await this.postModel
        .find({ _id: { $in: ids } })
        .populate('autor', 'username email avatar')
        .populate('comentarios.usuario', 'username email avatar perfil')
        .exec();

      return ids.map(id => posts.find(p => p._id.toString() === id.toString())).filter(Boolean);
    }

    let consulta = this.postModel
      .find(filtros)
      .populate('autor', 'username email avatar')
      .populate('comentarios.usuario', 'username email avatar perfil')
      .sort({ createdAt: -1 });

    if (query.offset) {
      consulta = consulta.skip(offset);
    }

    if (query.limit) {
      consulta = consulta.limit(limit);
    }

    return consulta.exec();
  }

  async findOne(postId: string) {
    const post = await this.postModel
      .findById(postId)
      .populate('autor', 'username email avatar')
      .populate('comentarios.usuario', 'username email avatar perfil')
      .exec();

    if (!post) throw new NotFoundException('Publicación no encontrada');
    return post;
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
      editado: false,
    } as any);

    await post.save();

    return this.postModel
      .findById(postId)
      .populate('autor', 'username email avatar')
      .populate('comentarios.usuario', 'username email avatar perfil')
      .exec();
  }

  async editComment(postId: string, commentId: string, texto: string, userId: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    const comentario = post.comentarios.id(commentId);

    if (!comentario) throw new NotFoundException('Comentario no encontrado');

    if (comentario.usuario.toString() !== userId) {
      throw new NotFoundException('No tenés permisos para editar este comentario');
    }

    comentario.texto = texto;
    comentario.editado = true;

    await post.save();

    return this.postModel
      .findById(postId)
      .populate('autor', 'username email avatar')
      .populate('comentarios.usuario', 'username email avatar perfil')
      .exec();
  }

  async remove(postId: string, userId: string, userPerfil: string) {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Publicación no encontrada');

    if (post.autor.toString() !== userId && userPerfil !== 'admin') {
      throw new NotFoundException('No tenés permisos para eliminar este post');
    }

    return this.postModel.findByIdAndDelete(postId);
  }
}