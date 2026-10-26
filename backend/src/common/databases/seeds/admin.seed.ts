import { Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/users/user.service';
import * as bcrypt from 'bcryptjs';
import { UserRole, UserStatus } from 'src/modules/users/interfaces/user.interface';

@Injectable()
export class AdminSeeder {
  constructor(private readonly userService: UserService) {}

  async run() {
    const adminEmail = 'phamthiendong2004@gmail.com';

    const existingAdmin = await this.userService.findOne({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    const password = 'thiendong2004@';
    const hashed = await bcrypt.hash(password, 10);

    await this.userService.create({
      firstName: 'Admin',
      lastName: 'System',
      email: adminEmail,
      password: hashed,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isActive: true
    });

    console.log('Admin created');
  }
}
