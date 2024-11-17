import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {
  FormControl,
  FormControlName,
  FormGroup,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { WebRequestService } from '../web-request.service';
import { takeUntil  } from 'rxjs/operators';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})   
export class ChangePasswordComponent implements OnInit, OnDestroy  {
  changePasswordForm = new FormGroup(
    {
      currentPassword:new FormControl(''),
      newPassword: new FormControl('', [ Validators.required, this.passwordValidator]),
      retypePassword: new FormControl(''),
    },
    {
      validators: this.passwordMatchValidator as ValidatorFn,
    }
  )
  userData: any | null = null;
  passwordChangeSuccess = false;
  private destroy$ = new Subject<void>();

 
  constructor(private router : Router, private webRequestServices: WebRequestService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.webRequestServices.currentUserEmail.pipe(
      takeUntil(this.destroy$)
    ).subscribe(email => {
      this.userData = null; 
      if (email) {
        this.webRequestServices.getUserDataByEmail(email).pipe(
          takeUntil(this.destroy$)
        ).subscribe(userData => {
          this.userData = userData;
          console.log('User Data:', this.userData);
        }, error => {
          console.error('Error getting user data:', error);
        });
      }
    });
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCloseClick() {    
    this.destroy$.next();
    this.destroy$.complete();

    this.userData = null; 
    this.webRequestServices.setUserEmail(null);
    this.router.navigate(['/login']);
  }

  


  passwordValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
    const currentPassword = formGroup.get('currentPassword')?.value;
    const newPassword = formGroup.value;

    if (currentPassword === newPassword) {
      formGroup.get('newPassword')?.setErrors({ sameAsCurrentPassword: true });
      return { sameAsCurrentPassword: true };
    }

    if (!newPassword) {
      return { required: true };
    }

    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!regex.test(newPassword)) {
      return {
        invalidPassword: true,
      };
    }
    return null;
  }

  passwordMatchValidator(formGroup: FormGroup): null | { passwordMismatch: boolean } {
    const newPassword = formGroup.get('newPassword')?.value;
    const retypePassword = formGroup.get('retypePassword')?.value;

    if (newPassword !== retypePassword) {
      formGroup.get('retypePassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;      
  }


  
  onSubmit() {
    const currentPassword = this.changePasswordForm.get('currentPassword')?.value || '';
    const newPassword = this.changePasswordForm.get('newPassword')?.value || '';
    const retypePassword = this.changePasswordForm.get('retypePassword')?.value || '';

    if (!currentPassword || !newPassword || !retypePassword) {
      alert('Please provide all required passwords.');
      return;
    }

    if (this.changePasswordForm.valid) {
      if (this.userData?.userData?.EmployeeId) {
        const employeeId = this.userData.userData.EmployeeId;

        this.webRequestServices.compareCurrentPassword(employeeId, currentPassword).subscribe(
          (response) => {
            if (response.match) {
              if (currentPassword === newPassword) {
                this.changePasswordForm.get('newPassword')?.setErrors({ sameAsCurrentPassword: true });
                return;
              }

              this.webRequestServices.updateUserPassword(employeeId, newPassword).subscribe(
                () => {
                  console.log('Password changed successfully.');
                  this.passwordChangeSuccess = true;
                  this.changePasswordForm.reset();
                },
                (error) => {
                  console.error('Error changing password:', error);
                }
              );
            } else {
              this.changePasswordForm.get('currentPassword')?.setErrors({ incorrectPassword: true });
            }
          },
          (error) => {
            console.error('Error comparing passwords:', error);
          }
        );
      } else {
        console.error('Employee ID not available.');
      }
    }
  }
}