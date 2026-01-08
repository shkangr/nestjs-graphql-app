import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post } from './models/post.model';
import { User } from '../users/models/user.model';
import { Comment } from '../comments/models/comment.model';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IDataLoaders } from '../common/dataloader/dataloader.interface';

@Resolver(() => Post)
export class PostsResolver {
  constructor(private postsService: PostsService) {}

  @Mutation(() => Post)
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Args('createPostDto') createPostDto: CreatePostDto,
    @CurrentUser() user: any,
  ) {
    return this.postsService.create(createPostDto, user.id);
  }

  @Query(() => [Post])
  async posts() {
    return this.postsService.findAll();
  }

  @Query(() => Post)
  async post(@Args('id', { type: () => ID }) id: string) {
    return this.postsService.findOne(id);
  }

  @Mutation(() => Post)
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Args('id', { type: () => ID }) id: string,
    @Args('updatePostDto') updatePostDto: UpdatePostDto,
    @CurrentUser() user: any,
  ) {
    return this.postsService.update(id, updatePostDto, user.id, user.role);
  }

  @Mutation(() => Post)
  @UseGuards(JwtAuthGuard)
  async removePost(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ) {
    return this.postsService.remove(id, user.id, user.role);
  }

  // DataLoader를 사용한 관계 필드 해결
  @ResolveField(() => User)
  async author(
    @Parent() post: Post,
    @Context() context: { loaders: IDataLoaders },
  ) {
    return context.loaders.userLoader.load(post.authorId);
  }

  @ResolveField(() => [Comment])
  async comments(
    @Parent() post: Post,
    @Context() context: { loaders: IDataLoaders },
  ) {
    return context.loaders.commentsByPostLoader.load(post.id);
  }
}
