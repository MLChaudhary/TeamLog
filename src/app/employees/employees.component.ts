  import { Component, OnInit } from '@angular/core';
  import { Router } from '@angular/router';
  import { WebRequestService } from '../web-request.service';

  @Component({
    selector: 'app-employees',
    templateUrl: './employees.component.html',
    styleUrl: './employees.component.css'
  })
  export class EmployeesComponent  implements OnInit  {
    searchFirstName: string = '';
    searchDepartment: string = '';
    // searchDepartment: string = 'Accts';      
    employeeList: any[] = []; 
    originalEmployeeList: any[] = [];

    constructor(private router: Router, private webRequestService: WebRequestService) {}

    ngOnInit() {
      this.getEmployeeData();
    }

    getEmployeeData() {
      const params: any = {
        searchFirstName: this.searchFirstName,
        searchDepartment: this.searchDepartment
      };

      this.webRequestService.getEmployeesByID(params).subscribe(
        (data) => {
          this.employeeList = data;
          this.originalEmployeeList = data;
          console.log('Employee Data:', data);  
        },
        (error) => {
          console.error('Error fetching employee data', error);
        }
      );
    }

    addNewEmployee() {
      this.router.navigate(['/new-employee']);
    }

    closePage() {
      this.router.navigate(['/home']);  
    }

    search() {
      if (this.searchFirstName === '' && this.searchDepartment === 'Accts') {
        this.employeeList = this.originalEmployeeList;
        return;
      }
      const filteredEmployees = this.originalEmployeeList.filter(employee => {
        const isFirstNameMatch = employee.FirstName.toLowerCase().includes(this.searchFirstName.toLowerCase());
        const isDepartmentMatch = this.searchDepartment === '' || employee.Department === this.searchDepartment;

        return isFirstNameMatch && isDepartmentMatch;
      });
      this.employeeList = filteredEmployees;
    }

    updateEmployee(firstName: string, middleName: string, lastName: string, department: string) {
      this.webRequestService.getEmployeeDetails(firstName, middleName, lastName, department).subscribe(
        (data: any[]) => {
          if (data && data.length > 0) {
            const employeeDetails = data[0];
            console.log('Received Employee Details:', employeeDetails);
    
            if ('EmployeeID' in employeeDetails && typeof employeeDetails.EmployeeID === 'number' && !isNaN(employeeDetails.EmployeeID)) {
              const employeeDetailsString = JSON.stringify(employeeDetails);
              this.router.navigate(['/new-employee'], { queryParams: { isUpdate: 'true', employeeDetails: employeeDetailsString, EmployeeID: employeeDetails.EmployeeID } });
            } else {
              console.error('EmployeeID is not a valid number in employeeDetails or is not present.');
            }
          } else {
            console.error('No employee details found.');     
          }
        },
        (error) => {
          console.error('Error fetching employee details', error);
        }
      );
    }
    deleteEmployee(employeeID: number) {
      const isConfirmed = window.confirm('Are you sure you want to delete this employee?');
  
      if (isConfirmed) {
        this.webRequestService.deleteEmployee(employeeID).subscribe(
          () => {
            this.employeeList = this.employeeList.filter(employee => employee.EmployeeID !== employeeID);
            console.log('Employee deleted successfully.');
          },
          (error) => {
            console.error('Error deleting employee', error);
          }
        );
      }
    }
  }
