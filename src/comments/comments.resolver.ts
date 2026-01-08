import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './models/comment.model';
import { User } from '../users/models/user.model';
import { Post } from '../posts/models/post.model';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IDataLoaders } from '../common/dataloader/dataloader.interface';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(private commentsService: CommentsService) {}

  @Mutation(() => Comment)
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Args('createCommentDto') createCommentDto: CreateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.create(createCommentDto, user.id);
  }

  @Query(() => [Comment])
  async comments() {
    return this.commentsService.findAll();
  }

  @Query(() => Comment)
  async comment(@Args('id', { type: () => ID }) id: string) {
    return this.commentsService.findOne(id);
  }

  @Mutation(() => Comment)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateCommentDto') updateCommentDto: UpdateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.update(
      id,
      updateCommentDto,
      user.id,
      user.role,
    );
  }

  @Mutation(() => Comment)
  @UseGuards(JwtAuthGuard)
  async removeComment(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ) {
    return this.commentsService.remove(id, user.id, user.role);
  }

  // DataLoader를 사용한 관계 필드 해결
  @ResolveField(() => User)
  async author(
    @Parent() comment: Comment,
    @Context() context: { loaders: IDataLoaders },
  ) {
    return context.loaders.userLoader.load(comment.authorId);
  }

  @ResolveField(() => Post)
  async post(
    @Parent() comment: Comment,
    @Context() context: { loaders: IDataLoaders },
  ) {
    return context.loaders.postLoader.load(comment.postId);
  }
}
