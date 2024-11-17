  import { Component, OnInit } from '@angular/core';
  import { Router } from '@angular/router';
  import { WebRequestService } from '../web-request.service';
  import Chart from 'chart.js/auto';


  @Component({
    selector: 'app-reports',
    templateUrl: './reports.component.html',
    styleUrl: './reports.component.css'    
  })
  export class ReportsComponent implements OnInit {
    users: { FirstName: string }[] = []; 
    months: string[] = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
    years: number[] = []; 
    selectedUser: string = '';
    selectedMonth: string = '';
    selectedYear: number = 0;
    myPieChart: Chart<"pie", number[], string> | undefined; 

    constructor(private router: Router, private webRequestService: WebRequestService) {}

    ngOnInit(): void {
      this.getEmployeeData();
      this.generateYears();
    }
    
    getEmployeeData() {
      this.webRequestService.getEmployeesByID({}).subscribe(
        (data) => {
          this.users = data;  
          console.log('Employee Data:', data);  
        },
        (error) => {
          console.error('Error fetching employee data', error);
        }
      );
    }

    generateYears(): void {
      const currentYear = new Date().getFullYear();
      const startYear = 1988;
      for (let year = startYear; year <= currentYear; year++) {
        this.years.push(year);
      }
    }

    generateReport(): void {
      if (this.selectedUser && this.selectedMonth && this.selectedYear) {
        console.log('User:', this.selectedUser);
        console.log('Month:', this.selectedMonth);
        console.log('Year:', this.selectedYear);

        this.webRequestService.getAttendanceData(this.selectedUser, this.months.indexOf(this.selectedMonth) + 1, this.selectedYear)
          .subscribe(
            (data) => {
              if (data && data.length > 0) {
                this.generatePieChart(data[0]);
                this.selectedUser = '';
                this.selectedMonth = '';
                this.selectedYear =  0;
              } else {
                alert('No attendance data found for the selected user, month, and year.');
              }
            },
            (error) => {
              console.error('Error fetching attendance data', error);
            }
          );
      } else {
        alert('User, Month, and Year selection are mandatory.');
      }
    }
    
    generatePieChart(userAttendance: any): void {
      if (this.myPieChart) {
        this.myPieChart.destroy();
      }
      const totalDays = userAttendance.presentDays + userAttendance.absentDays;
      const presentPercentage = (userAttendance.presentDays / totalDays) * 100;
      const absentPercentage = (userAttendance.absentDays / totalDays) * 100;
    
      const ctx = document.getElementById('myPieChart') as HTMLCanvasElement;
      this.myPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Present', 'Absent'],
          datasets: [
            {
              data: [presentPercentage, absentPercentage],
              backgroundColor: ['#36A2EB', '#FF6384'],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, 
        },
      });
    }
    

    closeReport() {
      this.router.navigate(['/home']);
    }
  }
