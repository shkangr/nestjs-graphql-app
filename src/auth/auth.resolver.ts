import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse } from './models/auth.model';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async register(@Args('createUserDto') createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('loginDto') loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
