import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { Comment } from '../../comments/models/comment.model';

@ObjectType()
export class Post {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  published: boolean;

  @Field()
  authorId: string;

  @Field(() => User, { nullable: true })
  author?: User;

  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
