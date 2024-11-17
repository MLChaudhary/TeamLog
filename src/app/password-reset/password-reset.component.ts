import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WebRequestService } from '../web-request.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css']
})
export class PasswordResetComponent implements OnInit {
  email: string | null = null;
  resetToken: string | null = null;
  newPasswordForm = new FormGroup({
    newPassword: new FormControl('', [Validators.required, this.passwordValidator])
  });

  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private webRequestService: WebRequestService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.email = params['email'];
      this.resetToken = params['resetToken'];
    });
  }

  passwordValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
    const newPassword = formGroup.value;

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

  onCloseClick() {
    this.router.navigate(['/login']);
  }

  onSubmit() {
    if (this.newPasswordForm.valid && this.email) {
      const newPassword = this.newPasswordForm.get('newPassword')?.value || '';

      this.webRequestService.resetPassword(this.email, newPassword).subscribe(
        (response) => {
          console.log('Password updated successfully:', response.message);
          this.successMessage = response.message;
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Error resetting password:', error);
          this.errorMessage = 'Error resetting password. Please try again later.';
        }
      );
    }
  }
}
