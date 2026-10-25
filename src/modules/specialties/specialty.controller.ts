import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SpecialtyService } from './specialty.service';
import { CreateSpecialtyDto } from './dto/createSpecialty.dto';
import { UpdateSpecialtyDto } from './dto/updateSpecialty.dto';

@ApiTags('Specialties')
@ApiBearerAuth()
@Controller('specialties')
export class SpecialtyController {
  constructor(private readonly specialtyService: SpecialtyService) {}

  @Post()
  @ApiOperation({ summary: 'Thêm chuyên khoa mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 409, description: 'Chuyên khoa đã tồn tại' })
  create(@Body() createSpecialtyDto: CreateSpecialtyDto) {
    return this.specialtyService.create(createSpecialtyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả chuyên khoa' })
  findAll() {
    return this.specialtyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một chuyên khoa' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.specialtyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật chuyên khoa' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSpecialtyDto: UpdateSpecialtyDto,
  ) {
    return this.specialtyService.update(id, updateSpecialtyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa chuyên khoa' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.specialtyService.remove(id);
  }
}
