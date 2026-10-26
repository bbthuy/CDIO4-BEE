import { Controller, Post, Body, HttpException, HttpStatus, Get, Param, Patch, Delete } from '@nestjs/common';
import { Public } from 'src/modules/auth/decorators/public.decorator';
import { GeminiService } from '../service/gemini.service';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  // Endpoint cho người dùng chat
  @Public()
  @Post('chat')
  async chat(@Body() body: { prompt: string }) {
    try {
      const { prompt } = body;
      const response = await this.geminiService.handleUserPrompt(prompt);
      return { response };
    } catch (error) {
      console.error('Gemini Controller Error:', error);
      throw new HttpException('Failed to get response from AI service.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
