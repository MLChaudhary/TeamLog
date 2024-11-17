import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NewUserComponent } from './new-user/new-user.component';
import { LoginComponent } from './login/login.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EmployeesComponent } from './employees/employees.component';
import { ReportsComponent } from './reports/reports.component';
import { AttendanceComponent } from './attendance/attendance.component';


import { HttpClientModule } from '@angular/common/http';
import { NewEmployeeComponent } from './new-employee/new-employee.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';

@NgModule({
  declarations: [
    AppComponent,
    NewUserComponent,
    LoginComponent,
    ChangePasswordComponent,
    ForgotPasswordComponent,
    HomeComponent,
    EmployeesComponent,
    ReportsComponent,
    AttendanceComponent,
    NewEmployeeComponent,
    PasswordResetComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent },
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
