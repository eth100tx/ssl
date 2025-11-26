// SSL Inc. TypeScript Types

export interface Customer {
  id: number;
  name: string;
  company: string | null;
  contact_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  fax: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type EquipmentCategory = 'audio' | 'video' | 'lighting' | 'other';
export type EquipmentStatus = 'available' | 'reserved' | 'out' | 'maintenance';

export interface Equipment {
  id: number;
  serial_number: string | null;
  name: string;
  category: EquipmentCategory;
  sale_price: number | null;
  rental_rate: number | null;
  description: string | null;
  specifications: string | null;
  status: EquipmentStatus;
  maintenance_due_date: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderType = 'proposal' | 'order' | 'invoice';
export type OrderStatus = 'draft' | 'sent' | 'accepted' | 'completed' | 'cancelled';

export interface Order {
  id: number;
  customer_id: number;
  order_number: string;
  type: OrderType;
  status: OrderStatus;
  event_date: string | null;
  event_address: string | null;
  event_city: string | null;
  event_state: string | null;
  event_zip: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  ship_date: string | null;
  ship_method: string | null;
  payment_method: string | null;
  payment_terms: string | null;
  tax_exempt_number: string | null;
  comments: string | null;
  sales_total: number;
  rental_total: number;
  operator_total: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  customer?: Customer;
  items?: OrderItem[];
}

export type OrderItemType = 'sale' | 'rental' | 'operator';

export interface OrderItem {
  id: number;
  order_id: number;
  equipment_id: number | null;
  item_type: OrderItemType;
  description: string | null;
  skill: string | null;
  quantity: number;
  unit_price: number | null;
  rental_start: string | null;
  rental_end: string | null;
  hours: number | null;
  total: number | null;
  created_at: string;
  // Joined fields
  equipment?: Equipment;
}

export interface OrderWorker {
  id: number;
  order_id: number;
  employee_id: number;
  role: string | null;
  notes: string | null;
  created_at: string;
  // Joined fields
  employee?: Employee;
}

export type ReservationStatus = 'reserved' | 'out' | 'returned' | 'cancelled';

export interface Reservation {
  id: number;
  equipment_id: number;
  order_id: number | null;
  customer_name: string | null;
  reservation_date: string;
  event_date: string;
  time_out: string | null;
  time_due_in: string | null;
  time_returned: string | null;
  condition_notes: string | null;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  equipment?: Equipment;
  order?: Order;
}

// Employee types
export type EmployeeRole = 'president' | 'secretary' | 'technician' | 'contract';
export type EmployeeStatus = 'active' | 'inactive';

export interface Employee {
  id: number;
  name: string;
  role: EmployeeRole;
  phone: string | null;
  beeper: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  email: string | null;
  skills: string | null;
  hourly_rate: number | null;
  status: EmployeeStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ScheduleStatus = 'scheduled' | 'completed' | 'cancelled';

export interface EmployeeSchedule {
  id: number;
  employee_id: number;
  order_id: number | null;
  schedule_date: string;
  required_time_in: string | null;
  required_time_out: string | null;
  actual_time_in: string | null;
  actual_time_out: string | null;
  hours_worked: number | null;
  overtime_hours: number | null;
  notes: string | null;
  status: ScheduleStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  employee?: Employee;
  order?: Order;
}
