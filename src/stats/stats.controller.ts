import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { StatsService } from './stats.services.js';

@Controller('stats')
@UseGuards(JwtAuthGuard, AdminGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('dashboard')
  getEstadisticas(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    const fechaHasta = hasta || new Date().toISOString();
    const fechaDesde = desde || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();
    
    return this.statsService.getEstadisticas(fechaDesde, fechaHasta);
  }
}