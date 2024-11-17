import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {FormControl, FormControlName, FormGroup, Validators} from '@angular/forms';
import { WebRequestService } from '../web-request.service';


@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotPasswordForm = new FormGroup({
    EmailId: new FormControl('', [Validators.required]),
  });

  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private router: Router,  private webRequestService: WebRequestService) {}

  onCloseClick() {
    this.router.navigate(['/login']);
  }       

  submitForm() {
    if (this.forgotPasswordForm.valid) {
      const emailId = this.forgotPasswordForm.get('EmailId')?.value || '';

      this.webRequestService.checkEmailExists(emailId).subscribe(
        (response) => {
          console.log('Response from checkEmailExists:', response);
          if (response.emailExists) {

            const resetToken = this.generateResetToken();
            const resetLink = `${window.location.origin}/password-reset/${emailId}/${resetToken}`;
            
            this.webRequestService.sendPasswordByEmail({
              to: emailId,
              subject: 'Password Reset',
              text:  `Click here to reset your password: ${resetLink}`
            }).subscribe(
              () => {
                console.log('Original password sent to the user');
                this.successMessage = 'Password sent successfully! Check your email.';
              },
              (error) => {
                console.error('Error sending password by email', error);
                this.errorMessage = 'Error sending password reset email. Please try again later.';
              }
            );
          } else {
            console.log('Email does not exist');
            this.forgotPasswordForm.get('EmailId')?.setErrors({ notRegistered: true });
          }
        },
        (error) => {
          console.error('Error checking email:', error);
          this.errorMessage = 'Error checking email. Please try again later.';
        }
      );
    }
  }

  private generateResetToken(): string {
    const timestamp = Date.now();
    return btoa(timestamp.toString());
  }
}
