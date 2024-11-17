import { Component } from '@angular/core';
import {FormControl, FormControlName, FormGroup, Validators} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { WebRequestService } from '../web-request.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm = new FormGroup ({
    EmailId: new FormControl('', [Validators.required, Validators.email]),
    Password: new FormControl('',  [Validators.required]),
  })

  constructor(private router: Router, private webRequestService: WebRequestService, private route: ActivatedRoute) {}

  invalidCredentials = false;

  // login() {
  //   this.router.navigate(['/home']);
  // }

  // onSubmit(){
  //   console.log(this.loginForm.value);
  //   this.login();
  // }

  
  onSubmit() {
    const emailId = this.loginForm.get('EmailId')?.value || '';
    const password = this.loginForm.get('Password')?.value || '';
  
    this.webRequestService.checkEmailExists(emailId).subscribe(
      (response) => {   
        if (response.emailExists) {
          // For change Password
          console.log('Email passed to change password page:', emailId);
          this.webRequestService.setUserEmail(emailId);

          this.loginWithCredentials(emailId, password);
        } else {
          this.loginForm.get('EmailId')?.setErrors({ notRegistered: true });
        }
      },
      (error) => {
        console.error('Error checking email:', error);
      }
    );
  }   
  
  loginWithCredentials(emailId: string, password: string) {
    this.webRequestService.comparePassword({ EmailId: emailId, Password: password }).subscribe(
      (response) => {
        if (response.match) {
          console.log('Login successful', this.loginForm.value);
          this.webRequestService.setUsername(emailId);
          this.router.navigate(['/home']);
          this.loginForm.reset();
        } else {
          console.error('Login failed: Invalid email or password');
          this.invalidCredentials = true;
        }
      },
      (error) => {
        console.error('Login failed:', error);
        if (error.status === 401) {
          this.invalidCredentials = true;
        }
      }
    );
  }  
}
