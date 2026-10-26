import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { memoryStorage } from 'multer';

@Controller('uploads')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      }
    })
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    console.log('Received file:', file); // Debug

    if (!file) {
      throw new BadRequestException('File is required');
    }

    const uploaded = await this.cloudinaryService.uploadImage(file);
    return {
      message: 'Upload image successfully',
      url: uploaded.secure_url
    };
  }

  @Post('pdf')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
      }
    })
  )
  async uploadPDF(@UploadedFile() file: Express.Multer.File) {
    console.log('Received file:', file); // Debug

    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      const uploaded = await this.cloudinaryService.uploadPDF(file);
      return {
        message: 'Upload PDF successfully',
        url: uploaded.secure_url
      };
    } catch (error) {
      // In ra lỗi chi tiết từ Cloudinary vào console của server
      console.error('Cloudinary upload failed:', error);
      // Ném ra một lỗi rõ ràng hơn
      throw new InternalServerErrorException('Failed to upload PDF to Cloudinary.');
    }
  }
}
