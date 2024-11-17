import { Component } from '@angular/core';
import { Router } from '@angular/router';

import {
  FormControl,
  FormControlName,
  FormGroup,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { WebRequestService } from '../web-request.service';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrl: './new-user.component.css',
})
export class NewUserComponent {
  newUserRegistrationForm = new FormGroup(
    {
      firstName: new FormControl(''),
      middleName: new FormControl(''),
      lastName: new FormControl(''),
      country: new FormControl(''),
      mobileNo: new FormControl('', [
        Validators.required,
        this.mobileNumberValidator,
      ]),
      emailId: new FormControl('', [Validators.required, this.emailValidator]),
      alternateNo: new FormControl(''),
      alternateEmailId: new FormControl(''),
      password: new FormControl('', [
        Validators.required,
        this.passwordValidator,
      ]),
      retypePassword: new FormControl(''),
    },
    {
      validators: this.passwordMatchValidator as ValidatorFn,
    }
  );

  emailExists: boolean = false;
  registrationSuccess: boolean = false;

  constructor(
    private router: Router,
    private webRequestService: WebRequestService
  ) {}

  onCloseClick() {  
    this.router.navigate(['/login']);
  }

  mobileNumberValidator(
    formGroup: FormGroup
  ): { [key: string]: boolean } | null {
    const mobileNumber = formGroup.value;

    if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
      return { invalidMobileNumber: true };
    }
    return null;
  }

  emailValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
    const email = formGroup.value;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      return { invalidEmail: true };
    }
    return null;
  }

  passwordValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
    const password = formGroup.value;
    if (!password) {
      return { required: true };
    }

    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!regex.test(password)) {
      return {
        invalidPassword: true,
      };
    }
    return null;
  }

  passwordMatchValidator(
    formGroup: FormGroup
  ): null | { passwordMismatch: boolean } {
    const password = formGroup.get('password')?.value;
    const retypePassword = formGroup.get('retypePassword')?.value;

    if (password !== retypePassword) {
      formGroup.get('retypePassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.newUserRegistrationForm.valid) {
      const email = this.newUserRegistrationForm.get('emailId')?.value;

      if (email) {
        this.webRequestService.checkEmailExists(email).subscribe(
          (response) => {
            this.emailExists = response.emailExists;

            if (this.emailExists) {
              this.newUserRegistrationForm.get('emailId')?.setErrors({ invalidEmail: false });
            } else {
              this.webRequestService.registerUser(this.newUserRegistrationForm.value).subscribe(
                (registrationResponse) => {
                  console.log('Registration successful', this.newUserRegistrationForm.value,registrationResponse);
                  this.registrationSuccess = true;
                  this.newUserRegistrationForm.reset();
                },
                (registrationError) => {
                  console.error('Registration failed', registrationError);
                }
              );
            }
          },
          (error) => {
            console.error('Email check failed', error);
          }
        );
      } else {
        console.error('Email is undefined.');
      }
    } else {
      alert('Please fill in all required fields.');
    }
  }
}
