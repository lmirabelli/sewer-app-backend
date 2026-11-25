import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @Patch('profile')
  updateProfile(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id/estado')
  @UseGuards(AdminGuard)
  toggleEstado(@Param('id') id: string) {
    return this.usersService.toggleEstado(id);
  }
}