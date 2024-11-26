export interface Employee {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
  iin: string;
  phone: string;
  position: string;
  salary: number;
  email: string;
  createdAt: any;
}

export interface NewEmployee {
  lastName: string;
  firstName: string;
  middleName: string;
  iin: string;
  phone: string;
  position: string;
  salary: number;
  email: string;
}

export const initialEmployeeState: NewEmployee = {
  lastName: '',
  firstName: '',
  middleName: '',
  iin: '',
  phone: '',
  position: '',
  salary: 0,
  email: ''
};