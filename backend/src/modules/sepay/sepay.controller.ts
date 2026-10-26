import { Controller, Post, Body, Get, Param, ValidationPipe, HttpCode } from '@nestjs/common';
import { SepayService } from './sepay.service';
import { SepayWebhookDto } from './dto/sepayWebhook.dto';
import { CreatePaymentDto } from './dto/createPayment.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('payments/sepay')
export class SepayController {
  constructor(private readonly sepayService: SepayService) {}

  @Post('create')
  async createPayment(@Body(new ValidationPipe({ whitelist: true })) createPaymentDto: CreatePaymentDto) {
    return this.sepayService.createPayment(createPaymentDto);
  }

  @Get('status/:orderCode')
  async getPaymentStatus(@Param('orderCode') orderCode: string) {
    return this.sepayService.getPaymentStatus(orderCode);
  }
  // Để SePay gọi vào mà không cần đăng nhập
  @Public()
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() rawPayload: any) {
    console.log('RAW PAYLOAD từ SePay:', JSON.stringify(rawPayload, null, 2));
    console.log('Amount value:', rawPayload.amount);
    console.log('Amount type:', typeof rawPayload.amount);
    console.log('All keys:', Object.keys(rawPayload));

    // Validate sau khi log
    const validationPipe = new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true }
    });

    try {
      const payload = await validationPipe.transform(rawPayload, {
        type: 'body',
        metatype: SepayWebhookDto
      });

      console.log('Payload sau validation:', payload);
      await this.sepayService.processWebhook(payload);
      return { message: 'ok' };
    } catch (error) {
      console.error('Validation error:', error);
      if (error.response) console.error('Chi tiết:', error.response);
      return { message: 'error', error: error.message };
    }
  }
  // Để Frontend check trạng thái mà không cần login
  @Public()
  @Get('check/:orderCode')
  async checkPayment(@Param('orderCode') orderCode: string) {
    const result = await this.sepayService.checkPaymentFromSepay(orderCode);

    return {
      success: true,
      orderCode,
      isPaid: result.isPaid,
      status: result.status,
      checkedAt: new Date().toISOString()
    };
  }
}
