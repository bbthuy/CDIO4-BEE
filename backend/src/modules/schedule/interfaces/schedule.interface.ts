export interface IAppointmentSchedule {
  id: number;
  doctorId: number;

  date: string;
  startTime: string; // "09:00"
  endTime: string; // "09:30"

  appointmentType: 'offline' | 'online';

  maxPatients: number;
  bookedPatients: number;

  createdAt: Date;
  updatedAt: Date;
}
