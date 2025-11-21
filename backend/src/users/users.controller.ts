import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users?page=1&limit=20
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.usersService.findAll(page, limit);
  }

  // GET /users/:id?page=1&limit=12
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 12,
  ) {
    const result = await this.usersService.findOne(id, page, limit);
    if (!result) throw new NotFoundException('Usuário não encontrado.');
    return result;
  }
}
