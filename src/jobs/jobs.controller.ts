import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // 🔹 Obtener todos los empleos
  @Get()
  async getAllJobs() {
    return this.jobsService.findAll();
  }

  // 🔹 Obtener un empleo por ID
  @Get(':id')
  async getJobById(@Param('id') id: number) {
    const job = await this.jobsService.findById(+id);
    if (!job) throw new NotFoundException('Empleo no encontrado');
    return job;
  }

  // 🔹 Crear nuevo empleo
  @Post()
  async createJob(@Body() data: any) {
    if (!data.titulo || !data.descripcion) {
      throw new BadRequestException('Faltan campos requeridos');
    }
    return this.jobsService.create(data);
  }

  // 🔹 Actualizar empleo
  @Put(':id')
  async updateJob(@Param('id') id: number, @Body() data: any) {
    return this.jobsService.update(+id, data);
  }

  // 🔹 Eliminar empleo
  @Delete(':id')
  async deleteJob(@Param('id') id: number) {
    return this.jobsService.delete(+id);
  }

  // 🔹 Postulación de usuario a empleo
  @Post(':id/apply')
  async applyJob(@Param('id') id: number, @Body() body: any) {
    if (!body.userId) throw new BadRequestException('Falta userId');
    return this.jobsService.postularAEmpleo(+id, body.userId);
  }

  // 🔹 Obtener postulaciones de usuario
  @Get('postulaciones/user/:userId')
  async getUserApplications(@Param('userId') userId: number) {
    return this.jobsService.findPostulacionesPorUsuario(+userId);
  }

  // 🔹 Obtener postulantes de un empleo (empresa)
  @Get(':id/postulantes')
  async getApplicants(@Param('id') id: number) {
    return this.jobsService.findPostulantesPorEmpleo(+id);
  }
}
