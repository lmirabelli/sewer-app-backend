import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service.js';
import { PostsController } from './posts.controller.js';
import { Post, PostSchema } from './schemas/post.schema.js';
import { StatsController } from '../stats/stats.controller.js';
import { StatsService } from '../stats/stats.services.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  controllers: [PostsController, StatsController],
  providers: [PostsService, StatsService],
})
export class PostsModule {}