import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { Post } from '../../posts/models/post.model';

@ObjectType()
export class Comment {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field()
  postId: string;

  @Field(() => Post, { nullable: true })
  post?: Post;

  @Field()
  authorId: string;

  @Field(() => User, { nullable: true })
  author?: User;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
