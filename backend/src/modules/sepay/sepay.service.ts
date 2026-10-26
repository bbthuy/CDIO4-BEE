import { Injectable, Logger, InternalServerErrorException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Payment, PaymentStatusEnum } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/createPayment.dto';
import { SepayWebhookDto } from './dto/sepayWebhook.dto';
// 🔥 Import BookingService để kích hoạt gửi mail
import { BookingService } from '../booking/booking.service';

@Injectable()
export class SepayService {
  private readonly logger = new Logger(SepayService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,

    // 🔥 Inject BookingService (Dùng forwardRef để tránh lỗi vòng lặp)
    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService
  ) {}

  // ==========================================================
  // 1. TẠO GIAO DỊCH + QR CODE
  // ==========================================================
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<any> {
    const { orderCode, amount } = createPaymentDto;

    this.logger.log(`Tạo giao dịch chờ thanh toán: ${orderCode} - ${amount}đ`);

    try {
      const existingPayment = await this.paymentRepository.findOne({ where: { orderCode } });
      const bankCode = this.configService.get('SEPAY_BANK_CODE') || 'TPBANK';
      const accountNumber = this.configService.get('SEPAY_ACCOUNT_NUMBER');
      const accountName = this.configService.get('SEPAY_ACCOUNT_NAME') || 'PHAM THIEN DONG';
      const transferContent = `TT CLINIC${orderCode}`;

      const qrUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.jpg?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}`;

      if (existingPayment) {
        this.logger.warn(`OrderCode ${orderCode} đã tồn tại, trả về lại`);
        return {
          orderCode,
          amount,
          qrUrl,
          bankInfo: { bankCode, accountNumber, accountName, transferContent },
          status: existingPayment.status
        };
      }

      const payment = this.paymentRepository.create({
        orderCode,
        amount,
        status: PaymentStatusEnum.PENDING
      });
      await this.paymentRepository.save(payment);

      this.logger.log(`Đã lưu payment vào DB: ${payment.id}`);
      return {
        orderCode,
        amount,
        qrUrl,
        bankInfo: { bankCode, accountNumber, accountName, transferContent },
        status: PaymentStatusEnum.PENDING
      };
    } catch (error) {
      this.logger.error(`CreatePayment Error: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
  }

  // ==========================================================
  // 2. LẤY TRẠNG THÁI THANH TOÁN
  // ==========================================================
  async getPaymentStatus(orderCode: string): Promise<{ status: PaymentStatusEnum }> {
    const payment = await this.paymentRepository.findOne({ where: { orderCode } });
    if (!payment) throw new NotFoundException(`Không tìm thấy giao dịch ${orderCode}`);
    return { status: payment.status };
  }

  // ==========================================================
  // 3. XỬ LÝ WEBHOOK TỪ SEPAY (QUAN TRỌNG NHẤT)
  // ==========================================================
  async processWebhook(payload: SepayWebhookDto) {
    this.logger.log(`Nhận webhook từ SePay: ${JSON.stringify(payload)}`);

    // Lấy nội dung chuyển khoản (ưu tiên description, nếu ko có thì lấy content)
    const content = payload.description || payload.content || '';
    const orderCode = this.extractOrderCode(content);

    if (!orderCode) {
      this.logger.warn('Không tìm thấy OrderCode trong nội dung chuyển khoản');
      return;
    }

    const payment = await this.paymentRepository.findOne({ where: { orderCode } });

    // Nếu chưa có payment record, có thể bỏ qua hoặc tạo mới tùy logic (ở đây mình return)
    if (!payment) {
      this.logger.warn(`Không tìm thấy Payment Record cho OrderCode: ${orderCode}`);
      return;
    }

    if (payment.status === PaymentStatusEnum.PAID) {
      this.logger.log(`Giao dịch ${orderCode} đã được xử lý trước đó.`);
      return;
    }

    // Cập nhật Payment thành PAID
    // 🔥 Sửa: Dùng payload.id thay vì transaction_id
    payment.transactionId = payload.id ? String(payload.id) : `TX_${Date.now()}`;
    payment.description = content;
    payment.status = PaymentStatusEnum.PAID;

    await this.paymentRepository.save(payment);
    this.logger.log(`Webhook: Đã cập nhật trạng thái PAID cho ${orderCode}`);

    // 🔥🔥🔥 GỌI BOOKING SERVICE ĐỂ GỬI MAIL VÀ CONFIRM BOOKING 🔥🔥🔥
    const bookingIdStr = orderCode.replace(/[^0-9]/g, ''); // Lấy số từ chuỗi (VD: CLINIC7 -> 7)
    const bookingId = parseInt(bookingIdStr, 10);

    if (!isNaN(bookingId)) {
      this.logger.log(`👉 Đang kích hoạt Booking ID: ${bookingId}`);
      await this.bookingService.completeBookingPayment(bookingId);
    }
  }

  // Helper tách mã đơn hàng
  private extractOrderCode(desc: string): string | null {
    // Regex tìm chuỗi CLINIC + số (VD: TT CLINIC123 -> CLINIC123)
    const match = desc.match(/CLINIC(\d+)/i) || desc.match(/TT\s*CLINIC(\d+)/i);
    return match ? `CLINIC${match[1]}` : null;
  }

  // ==========================================================
  // 4. CHECK PAYMENT (POLLING TỪ FE HOẶC CRON)
  // ==========================================================
  async checkPaymentFromSepay(orderCode: string): Promise<{ isPaid: boolean; status: string }> {
    this.logger.log(`Đang kiểm tra giao dịch trên SePay cho: ${orderCode}`);

    const payment = await this.paymentRepository.findOne({ where: { orderCode } });

    if (!payment) {
      return { isPaid: false, status: 'FAILED' };
    }

    // Nếu trong DB đã Paid rồi thì báo luôn
    if (payment.status === PaymentStatusEnum.PAID) {
      return { isPaid: true, status: 'PAID' };
    }

    // Nếu chưa, gọi API SePay để dò soát
    const apiUrl = this.configService.get('SEPAY_BASE_URL') || 'https://my.sepay.vn/userapi';
    const apiKey = this.configService.get('SEPAY_API_KEY');
    const accountNumber = this.configService.get('SEPAY_ACCOUNT_NUMBER');

    if (!apiKey) return { isPaid: false, status: payment.status };

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${apiUrl}/transactions/list`, {
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          params: { account_number: accountNumber, limit: 50 }
        })
      );

      const transactions = response.data?.transactions || [];
      const matchedTx = transactions.find((tx: any) => {
        const text = (tx.transaction_content || tx.content || tx.description || '').toUpperCase();
        return text.includes(orderCode.toUpperCase());
      });

      if (matchedTx) {
        // Cập nhật DB
        payment.status = PaymentStatusEnum.PAID;
        payment.transactionId = matchedTx.id ? String(matchedTx.id) : `TX_${Date.now()}`;
        payment.description = matchedTx.transaction_content || matchedTx.content;
        await this.paymentRepository.save(payment);

        this.logger.log(`Đã tìm thấy giao dịch trên SePay. Cập nhật PAID cho ${orderCode}`);

        // 🔥🔥🔥 GỌI BOOKING SERVICE ĐỂ KÍCH HOẠT (Phòng trường hợp Webhook xịt) 🔥🔥🔥
        const bookingIdStr = orderCode.replace(/[^0-9]/g, '');
        const bookingId = parseInt(bookingIdStr, 10);
        if (!isNaN(bookingId)) {
          await this.bookingService.completeBookingPayment(bookingId);
        }

        return { isPaid: true, status: 'PAID' };
      }

      return { isPaid: false, status: payment.status };
    } catch (error) {
      this.logger.error(`Lỗi khi check SePay API: ${error.message}`);
      return { isPaid: false, status: payment.status };
    }
  }
}
