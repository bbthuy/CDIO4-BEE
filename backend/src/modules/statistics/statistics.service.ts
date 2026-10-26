import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../booking/entities/booking.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { User } from '../users/entities/user.entity';
import { BookingStatus } from '../booking/enums/bookingStatus.enum';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}

  // =================================================================
  // 1. DASHBOARD CHO ADMIN (XEM TOÀN BỘ)
  // =================================================================
  async getAdminDashboard() {
    // Lấy ngày đầu tháng và cuối tháng
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Lấy đầu ngày và cuối ngày hôm nay
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // 1. Tổng doanh thu toàn hệ thống (Chỉ tính CONFIRMED hoặc COMPLETED)
    const revenueQuery = await this.bookingRepo
      .createQueryBuilder('booking')
      .select('SUM(booking.price)', 'total')
      .where('booking.status IN (:...statuses)', { statuses: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] })
      .getRawOne();

    const totalRevenue = Number(revenueQuery.total || 0);

    // 2. Thống kê trong tháng này
    const monthlyStats = await this.bookingRepo
      .createQueryBuilder('booking')
      .where('booking.createdAt BETWEEN :start AND :end', { start: startOfMonth, end: endOfMonth })
      .andWhere('booking.status IN (:...statuses)', { statuses: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] })
      .select('COUNT(booking.id)', 'count')
      .getRawOne();

    // 3. Thống kê hôm nay
    const dailyStats = await this.bookingRepo
      .createQueryBuilder('booking')
      .where('booking.createdAt BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
      .andWhere('booking.status IN (:...statuses)', { statuses: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] })
      .select(['COUNT(booking.id) as count', 'SUM(booking.price) as revenue'])
      .getRawOne();

    // 4. Đếm tổng User và Doctor
    const totalDoctors = await this.doctorRepo.count();
    const totalPatients = await this.userRepo.count({ where: { role: 'user' } as any });

    return {
      counters: {
        doctors: totalDoctors,
        patients: totalPatients,
        bookingsMonth: Number(monthlyStats.count || 0)
      },
      revenue: {
        total: totalRevenue, // 100%
        adminShare: totalRevenue * 0.4, // 40%
        doctorShare: totalRevenue * 0.6 // 60%
      },
      today: {
        bookings: Number(dailyStats.count || 0),
        revenue: Number(dailyStats.revenue || 0)
      }
    };
  }

  // =================================================================
  // 2. DASHBOARD CHO BÁC SĨ (CHỈ XEM CỦA MÌNH)
  // =================================================================
  async getDoctorDashboard(userId: number) {
    // Tìm bác sĩ dựa trên userId
    const doctor = await this.doctorRepo.findOne({ where: { userId } });
    if (!doctor) return { message: 'Bạn không phải là bác sĩ' };

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    // 1. Tổng doanh thu CỦA BÁC SĨ ĐÓ
    const revenueQuery = await this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoin('booking.schedule', 'schedule') // Join để lọc theo doctorId
      .where('schedule.doctor_id = :id', { id: doctor.id })
      .andWhere('booking.status IN (:...statuses)', { statuses: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] })
      .select('SUM(booking.price)', 'total')
      .getRawOne();

    const totalGross = Number(revenueQuery.total || 0);

    // 2. Thống kê hôm nay của bác sĩ
    const dailyStats = await this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoin('booking.schedule', 'schedule')
      .where('schedule.doctor_id = :id', { id: doctor.id })
      .andWhere('booking.createdAt BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
      .andWhere('booking.status IN (:...statuses)', { statuses: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] })
      .select(['COUNT(booking.id) as count', 'SUM(booking.price) as revenue'])
      .getRawOne();

    // 3. Tổng số lượt khám
    const totalBookings = await this.bookingRepo
      .createQueryBuilder('booking')
      .leftJoin('booking.schedule', 'schedule')
      .where('schedule.doctor_id = :id', { id: doctor.id })
      .getCount();

    return {
      overview: {
        totalBookings: totalBookings,
        bookingsToday: Number(dailyStats.count || 0)
      },
      revenue: {
        gross: totalGross, // Doanh thu tổng tạo ra
        netIncome: totalGross * 0.6, // Thực nhận (60%)
        today: Number(dailyStats.revenue || 0) * 0.6
      }
    };
  }

  // =================================================================
  // 3. BIỂU ĐỒ DOANH THU (7 NGÀY GẦN NHẤT) - Dùng cho ChartJS
  // =================================================================
  async getRevenueChart() {
    // 1. Lấy mốc thời gian 7 ngày trước
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const data = await this.bookingRepo
      .createQueryBuilder('booking')
      .select([
        // Alias 'date': Đặt tên giả cho cột ngày
        // Dùng %Y-%m-%d để sắp xếp cho đúng (Năm trước, tháng sau)
        "DATE_FORMAT(booking.createdAt, '%Y-%m-%d') as date",
        'SUM(booking.price) as revenue'
      ])
      .where('booking.createdAt >= :start', { start: sevenDaysAgo })
      .andWhere('booking.status IN (:...statuses)', { statuses: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] })

      // Gom nhóm theo cái tên giả 'date'
      .groupBy('date')

      // QUAN TRỌNG: Sắp xếp theo cái tên giả 'date' (Cái nhãn trên túi)
      // Chứ KHÔNG sắp xếp theo booking.createdAt (Thứ bên trong túi)
      .orderBy('date', 'ASC')
      .getRawMany();

    // Format lại ngày cho đẹp (VN) để trả về Frontend: 2025-11-25 -> 25/11
    return data.map((item) => ({
      date: item.date.split('-').reverse().slice(0, 2).join('/'),
      revenue: Number(item.revenue)
    }));
  }
}
