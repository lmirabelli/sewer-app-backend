import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { UsersService } from '../../users/users.service.js';
@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();
        if (req.user?.perfil !== 'admin') {
            throw new ForbiddenException('Acceso denegado. Solo administradores.');
        }
        return true;
    }
}

@Controller('users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Post()
    create(@Body() createUserDto: any) {
        return this.usersService.create(createUserDto);
    }

    @Patch(':id/estado')
    toggleEstado(@Param('id') id: string) {
        return this.usersService.toggleEstado(id);
    }
}