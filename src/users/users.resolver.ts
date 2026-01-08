import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { Post } from '../posts/models/post.model';
import { Comment } from '../comments/models/comment.model';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { IDataLoaders } from '../common/dataloader/dataloader.interface';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => [User])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async users() {
    return this.usersService.findAll();
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async user(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.findOne(id);
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: any) {
    return this.usersService.findOne(user.id);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateUserDto') updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.update(id, updateUserDto, user.id, user.role);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async removeUser(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ) {
    return this.usersService.remove(id, user.id, user.role);
  }

  // DataLoader를 사용한 관계 필드 해결
  @ResolveField(() => [Post])
  async posts(
    @Parent() user: User,
    @Context() context: { loaders: IDataLoaders },
  ) {
    return context.loaders.postsByUserLoader.load(user.id);
  }

  @ResolveField(() => [Comment])
  async comments(
    @Parent() user: User,
    @Context() context: { loaders: IDataLoaders },
  ) {
    return context.loaders.commentsByUserLoader.load(user.id);
  }
}
