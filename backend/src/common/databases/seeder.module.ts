import { Module } from '@nestjs/common';
import { AdminSeeder } from './seeds/admin.seed';
import { SeederService } from './seeder.service';
import { UserModule } from 'src/modules/users/user.module';

@Module({
  imports: [UserModule],
  providers: [AdminSeeder, SeederService],
  exports: [SeederService]
})
export class SeederModule {}
