import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException,
  Get,         
  UseGuards,   
  Request      
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(new BadRequestException('Solo se permiten archivos de imagen (jpg, jpeg, png, webp)'), false);
        }
        callback(null, true);
      },
    }),
  )
  async register(
    @Body() registerDto: RegisterDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      const uploadResult: any = await this.cloudinaryService.uploadImage(file);
      registerDto.avatar = uploadResult.secure_url;
    }

    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  validateToken(@Request() req: any) {
    return { valid: true, usuario: req.user };
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  refreshToken(@Request() req: any) {
    return this.authService.refreshToken(req.user.userId);
  }
}