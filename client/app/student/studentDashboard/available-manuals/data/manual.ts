
export type ManualStatus = 'Paid' | 'Ready for Pickup' | 'Collected' | 'Failed';

export type FilterTab = 'All' | 'Paid' | 'Ready for Pickup' | 'Collected' | 'Failed';

export interface Manual {
  id: string;
  code: string;
  title: string;
  department: string;
  level: string;
  price: string;
  paymentStatus: 'Paid';
  pickupStatus: 'Ready for Pickup' | 'Collected' | 'Failed';
  keycode: string;
  createdAt: string;
  collectedAt?: string;
  studentName: string;
  studentId: string;
  paystackRef: string;
}

export const INITIAL_MANUALS: Manual[] = [
  {
    id: '1',
    code: 'CSC311',
    title: 'System Analysis and Design',
    department: 'Computer Science',
    level: '500L',
    price: '₦3,500',
    paymentStatus: 'Paid',
    pickupStatus: 'Ready for Pickup',
    keycode: 'DMDAS-4827-CSC',
    createdAt: '2026-08-05 · 14:23',
    studentName: 'Michael O.',
    studentId: '2021/0451',
    paystackRef: 'PSK-20260805-A1B2C3',
  },
  {
    id: '2',
    code: 'CSC321',
    title: 'Computer Networks',
    department: 'Computer Science',
    level: '300L',
    price: '₦3,000',
    paymentStatus: 'Paid',
    pickupStatus: 'Collected',
    keycode: 'DMDAS-3901-CSC',
    createdAt: '2026-07-20 · 09:11',
    collectedAt: '2026-07-20 · 09:11',
    studentName: 'Michael O.',
    studentId: '2021/0451',
    paystackRef: 'PSK-20260720-B9C8D7',
  },
  {
    id: '3',
    code: 'CSC401',
    title: 'Artificial Intelligence',
    department: 'Computer Science',
    level: '400L',
    price: '₦3,800',
    paymentStatus: 'Paid',
    pickupStatus: 'Ready for Pickup',
    keycode: 'DMDAS-6614-CSC',
    createdAt: '2026-08-07 · 16:02',
    studentName: 'Michael O.',
    studentId: '2021/0451',
    paystackRef: 'PSK-20260807-C3D4E5',
  },
];
