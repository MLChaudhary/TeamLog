import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {
  FormControl,
  FormControlName,
  FormGroup,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { WebRequestService } from '../web-request.service';

@Component({
  selector: 'app-new-employee',
  templateUrl: './new-employee.component.html',
  styleUrl: './new-employee.component.css',
})
export class NewEmployeeComponent implements OnInit {
  newEmployeeForm = new FormGroup({
    firstName: new FormControl(''),
    middleName: new FormControl(''),
    lastName: new FormControl(''),
    department: new FormControl(''),
    dateOfJoin: new FormControl(''),
    dateOfBirth: new FormControl(''),
    Salary: new FormControl(''),
    address: new FormControl(''),
  });
  queryParams: any;
  public isUpdateMode: boolean = false;
  public buttonLabel: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private webRequestService: WebRequestService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.queryParams = params;
      this.isUpdateMode = params['isUpdate'] === 'true';
      this.setButtonLabel();
      this.populateForm();
    });
  }
  private setButtonLabel() {
    if (this.isUpdateMode) {
      this.buttonLabel = 'Update';
    } else {
      this.buttonLabel = 'Save';
    }
  }

  private populateForm() {
    const employeeDetails = JSON.parse(
      this.queryParams.employeeDetails || '{}'
    );
    this.newEmployeeForm.patchValue({
      firstName: employeeDetails.FirstName,
      middleName: employeeDetails.MiddleName,
      lastName: employeeDetails.LastName,
      department: employeeDetails.Department,
      dateOfJoin: employeeDetails.DateOfJoin,
      dateOfBirth: employeeDetails.DateOfBirth,
      Salary: employeeDetails.Salary,
      address: employeeDetails.Address,
    });
  }

  onClose() {
    this.router.navigate(['/employees']);
  }

  onSave() {
    const isFirstNameValid = this.newEmployeeForm.get('firstName')?.valid;
    const isMiddleNameValid = this.newEmployeeForm.get('middleName')?.valid;
    const isLastNameValid = this.newEmployeeForm.get('lastName')?.valid;
    const isDepartmentValid = this.newEmployeeForm.get('department')?.valid;

    if (
      isFirstNameValid &&
      isMiddleNameValid &&
      isLastNameValid &&
      isDepartmentValid
    ) {
      console.log(this.newEmployeeForm.value);

      if (this.isUpdateMode) {
        this.webRequestService
          .updateEmployee(
            this.queryParams.EmployeeID,
            this.newEmployeeForm.value
          )
          .subscribe(
            (response) => {
              console.log('Employee Update is successful', response);
              this.newEmployeeForm.reset();
              this.router.navigate(['/employees']);
            },
            (error) => {
              console.error('Employee Update failed', error);
            }
          );
      } else {
        this.webRequestService
          .registerEmployee(this.newEmployeeForm.value)
          .subscribe(
            (response) => {
              console.log('New Employee Registration is successful', response);
              this.newEmployeeForm.reset();
            },
            (error) => {
              console.error('New Employee Registration failed', error);
            }
          );
      }
    } else {
      alert('Please fill in all required fields.');
    }
  }
}
