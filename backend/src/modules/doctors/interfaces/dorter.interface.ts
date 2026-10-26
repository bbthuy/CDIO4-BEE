import { Specialty } from 'src/modules/specialty/entities/specialty.entity';

export interface IDoctor {
  id: number;
  userId: number;
  avatar?: string;
  specialtyId: number;
  specialty?: Specialty;
  experienceYears: number;
  consultationFee: number;
  bio?: string;
  education?: string;
  certificates?: string[];
}
export interface IDoctors {
  id: number;
  userId: number;
  avatar?: string;
  specialtyId: number;
  specialty?: Specialty;
  experienceYears: number;
  consultationFee: number;
  bio?: string;
  education?: string;
  certificates?: string[];
}
