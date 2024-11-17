import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WebRequestService } from '../web-request.service';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  FirstName: string = ''; 

  constructor(private router: Router, public webRequestService: WebRequestService) {}

  ngOnInit() {
    this.webRequestService.getUserInfo().subscribe(
      (userInfo) => {
        this.FirstName = userInfo.FirstName;
      },
      (error) => {
        console.error('Error fetching user information:', error);
      }
    );
  }

  logout() {
    this.router.navigate(['/login']);
  }

  navigateToEmployees() {
    this.router.navigate(['/employees']);
  }

  navigateToReports() {
    this.router.navigate(['/reports']);
  }

  navigateToAttendance() {
    this.router.navigate(['/attendance']);
  }
}

