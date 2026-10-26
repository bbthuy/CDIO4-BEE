import { Injectable } from '@nestjs/common';
import { AdminSeeder } from './seeds/admin.seed';

@Injectable()
export class SeederService {
  constructor(private readonly adminSeeder: AdminSeeder) {}

  async run() {
    console.log('Running all seeders...');
    await this.adminSeeder.run();
    console.log('Seeding completed!');
  }
}
