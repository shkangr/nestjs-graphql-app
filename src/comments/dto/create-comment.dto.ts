import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateCommentDto {
  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  postId: string;
}
