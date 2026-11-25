import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../posts/schemas/post.schema.js';

@Injectable()
export class StatsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async getEstadisticas(desde: string, hasta: string) {
    const matchFecha = {
      createdAt: {
        $gte: new Date(desde),
        $lte: new Date(hasta)
      }
    };

    const postsPorUsuario = await this.postModel.aggregate([
      { $match: matchFecha },
      { $group: { _id: '$autor', cantidad: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'usuario' } },
      { $unwind: '$usuario' },
      { $project: { username: '$usuario.username', cantidad: 1, _id: 0 } }
    ]);

    const comentariosPorPublicacion = await this.postModel.aggregate([
      { $match: matchFecha },
      { $unwind: '$comentarios' },
      { $match: { 'comentarios.createdAt': { $gte: new Date(desde), $lte: new Date(hasta) } } },
      { $group: { _id: '$_id', titulo: { $first: '$titulo' }, cantidad: { $sum: 1 } } },
      { $project: { titulo: 1, cantidad: 1, _id: 0 } },
      { $sort: { cantidad: -1 } },
      { $limit: 10 }
    ]);

    const comentariosPorFecha = await this.postModel.aggregate([
      { $unwind: '$comentarios' },
      { $match: { 'comentarios.createdAt': { $gte: new Date(desde), $lte: new Date(hasta) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$comentarios.createdAt' } },
          cantidad: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      postsPorUsuario,
      comentariosPorPublicacion,
      comentariosPorFecha
    };
  }
}