export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  description: string;
  category: 'hair' | 'nails' | 'makeup' | 'skincare';
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  service: Service;
  date: string;
  time: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
}