import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class UpdateCommentDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  content?: string;
}
