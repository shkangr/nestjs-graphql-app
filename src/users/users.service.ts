import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      // include 제거 - DataLoader가 처리함
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUserId: string,
    currentUserRole: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Users can only update their own profile unless they're an admin
    if (id !== currentUserId && currentUserRole !== 'ADMIN') {
      throw new ForbiddenException('You can only update your own profile');
    }

    const data: any = { ...updateUserDto };

    // Hash password if provided
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, currentUserId: string, currentUserRole: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Users can only delete their own account unless they're an admin
    if (id !== currentUserId && currentUserRole !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own account');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return user;
  }
}
