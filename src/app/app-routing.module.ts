import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { NewUserComponent } from './new-user/new-user.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { HomeComponent } from './home/home.component';
import { EmployeesComponent } from './employees/employees.component';
import { ReportsComponent } from './reports/reports.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { NewEmployeeComponent } from './new-employee/new-employee.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: NewUserComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'home', component: HomeComponent },
  { path: 'employees', component: EmployeesComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'attendance', component: AttendanceComponent },
  { path: 'new-employee', component: NewEmployeeComponent},
  { path: 'password-reset/:email/:resetToken', component: PasswordResetComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
