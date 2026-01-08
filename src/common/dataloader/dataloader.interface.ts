import * as DataLoader from 'dataloader';
import { User, Post, Comment } from '@prisma/client';

export interface IDataLoaders {
  userLoader: DataLoader<string, User>;
  postLoader: DataLoader<string, Post>;
  commentLoader: DataLoader<string, Comment>;
  postsByUserLoader: DataLoader<string, Post[]>;
  commentsByPostLoader: DataLoader<string, Comment[]>;
  commentsByUserLoader: DataLoader<string, Comment[]>;
}
