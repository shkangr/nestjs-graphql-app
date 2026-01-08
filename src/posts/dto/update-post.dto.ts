import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class UpdatePostDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  content?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
