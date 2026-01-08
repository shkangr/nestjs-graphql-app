import { Injectable } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Post, Comment } from '@prisma/client';
import { IDataLoaders } from './dataloader.interface';

@Injectable()
export class DataLoaderService {
  constructor(private prisma: PrismaService) {}

  createLoaders(): IDataLoaders {
    return {
      userLoader: this.createUserLoader(),
      postLoader: this.createPostLoader(),
      commentLoader: this.createCommentLoader(),
      postsByUserLoader: this.createPostsByUserLoader(),
      commentsByPostLoader: this.createCommentsByPostLoader(),
      commentsByUserLoader: this.createCommentsByUserLoader(),
    };
  }

  // 개별 User 로딩 (by ID)
  private createUserLoader(): DataLoader<string, User> {
    return new DataLoader<string, User>(async (userIds: readonly string[]) => {
      const users = await this.prisma.user.findMany({
        where: { id: { in: [...userIds] } },
      });

      const userMap = new Map(users.map((user) => [user.id, user]));
      return userIds.map((id) => {
        const user = userMap.get(id);
        if (!user) {
          return new Error(`User with ID ${id} not found`);
        }
        return user;
      });
    });
  }

  // 개별 Post 로딩 (by ID)
  private createPostLoader(): DataLoader<string, Post> {
    return new DataLoader<string, Post>(async (postIds: readonly string[]) => {
      const posts = await this.prisma.post.findMany({
        where: { id: { in: [...postIds] } },
      });

      const postMap = new Map(posts.map((post) => [post.id, post]));
      return postIds.map((id) => {
        const post = postMap.get(id);
        if (!post) {
          return new Error(`Post with ID ${id} not found`);
        }
        return post;
      });
    });
  }

  // 개별 Comment 로딩 (by ID)
  private createCommentLoader(): DataLoader<string, Comment> {
    return new DataLoader<string, Comment>(
      async (commentIds: readonly string[]) => {
        const comments = await this.prisma.comment.findMany({
          where: { id: { in: [...commentIds] } },
        });

        const commentMap = new Map(
          comments.map((comment) => [comment.id, comment]),
        );
        return commentIds.map((id) => {
          const comment = commentMap.get(id);
          if (!comment) {
            return new Error(`Comment with ID ${id} not found`);
          }
          return comment;
        });
      },
    );
  }

  // User의 모든 Posts 로딩 (by authorId)
  private createPostsByUserLoader(): DataLoader<string, Post[]> {
    return new DataLoader<string, Post[]>(
      async (userIds: readonly string[]) => {
        const posts = await this.prisma.post.findMany({
          where: { authorId: { in: [...userIds] } },
        });

        const postsByUser = new Map<string, Post[]>();
        posts.forEach((post) => {
          if (!postsByUser.has(post.authorId)) {
            postsByUser.set(post.authorId, []);
          }
          postsByUser.get(post.authorId)!.push(post);
        });

        return userIds.map((id) => postsByUser.get(id) || []);
      },
    );
  }

  // Post의 모든 Comments 로딩 (by postId)
  private createCommentsByPostLoader(): DataLoader<string, Comment[]> {
    return new DataLoader<string, Comment[]>(
      async (postIds: readonly string[]) => {
        const comments = await this.prisma.comment.findMany({
          where: { postId: { in: [...postIds] } },
        });

        const commentsByPost = new Map<string, Comment[]>();
        comments.forEach((comment) => {
          if (!commentsByPost.has(comment.postId)) {
            commentsByPost.set(comment.postId, []);
          }
          commentsByPost.get(comment.postId)!.push(comment);
        });

        return postIds.map((id) => commentsByPost.get(id) || []);
      },
    );
  }

  // User의 모든 Comments 로딩 (by authorId)
  private createCommentsByUserLoader(): DataLoader<string, Comment[]> {
    return new DataLoader<string, Comment[]>(
      async (userIds: readonly string[]) => {
        const comments = await this.prisma.comment.findMany({
          where: { authorId: { in: [...userIds] } },
        });

        const commentsByUser = new Map<string, Comment[]>();
        comments.forEach((comment) => {
          if (!commentsByUser.has(comment.authorId)) {
            commentsByUser.set(comment.authorId, []);
          }
          commentsByUser.get(comment.authorId)!.push(comment);
        });

        return userIds.map((id) => commentsByUser.get(id) || []);
      },
    );
  }
}
