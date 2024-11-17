import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { HttpClient } from '@angular/common/http';
import { WebRequestService } from '../web-request.service';


@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
})
export class AttendanceComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef | undefined; 

  users: { FirstName: string }[] = [];
  employeeId: string = '';
  selectedFile: File | null = null;  

  fileData: any[][] = [];
  validationMessage: string = '';
  showValidationMessage: boolean = false;

  constructor(private router: Router,  private http: HttpClient, private webRequestService: WebRequestService) {}

  ngOnInit(): void {
    this.getEmployeeData();
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

  closeAttendance() {
    this.router.navigate(['/home']);
  }

  downloadTemplate() {
    const header = ['FirstName', 'Present Days', 'Absent Days', 'Month', 'Year'];
    const data = [[]]; 
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const fileName = 'attendance_template.xlsx';
    XLSX.writeFile(wb, fileName);
  }

  
  uploadFile(event: any) {
    const file = event.target.files[0];
    console.log('Uploaded file:', file);
    this.employeeId = file.name;
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const fileHeaders = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];
      if (this.areHeadersValid(['FirstName', 'Present Days', 'Absent Days', 'Month', 'Year'], fileHeaders)) {
        this.fileData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      } else {        
        this.fileData = [];
      }
    };
    reader.readAsBinaryString(file);
  }


  uploadFileData() {
    // Reset file-related data
  // this.employeeId = '';
  // this.fileData = [];
  // this.validationMessage = '';
  // this.showValidationMessage = false;
  // this.selectedFile = null;

  // if (!this.selectedFile) {
  //   // Display an error message if no file is selected
  //   this.validationMessage = 'No file selected. Please choose a file to upload.';
  //   this.showValidationMessage = true;
  //   return;
  // }

    const expectedHeaders = ['FirstName', 'Present Days', 'Absent Days', 'Month', 'Year'];
    let validationErrors: string[] = [];
  
    if (!this.selectedFile) {
      validationErrors.push('No file selected. Please choose a file to upload.');
    } else {
      const invalidRows = this.fileData.filter(row => row.length !== expectedHeaders.length);
  
      if (invalidRows.length === 0) {
        console.log('File headers are valid. Proceed with data processing.');
        console.log('Uploaded File:', this.employeeId);
  
        const dataIsValid = this.validateNumericColumns(this.fileData.slice(1));
  
        if (dataIsValid) {
          console.log('File Data:', this.fileData.slice(1));
  
          const fileFirstNames = this.fileData.slice(1).map(row => row[expectedHeaders.indexOf('FirstName')].toLowerCase());
          const userFirstNames = this.users.map(user => user.FirstName.toLowerCase());
  
          const matchingNames = fileFirstNames.filter(fileName => userFirstNames.includes(fileName));
  
          if (matchingNames.length === fileFirstNames.length) {
            const invalidSumRows = this.fileData.slice(1).filter(row => {
              const presentDays = parseInt(row[expectedHeaders.indexOf('Present Days')], 10);
              const absentDays = parseInt(row[expectedHeaders.indexOf('Absent Days')], 10);
              const sum = presentDays + absentDays;
              return sum !== 24 && sum !== 25;
            });
  
            if (invalidSumRows.length > 0) {
              validationErrors.push('Invalid sum of "Present Days" and "Absent Days" in some rows.');
            }
  
            const currentYear = new Date().getFullYear();
            const invalidYearRows = this.fileData.slice(1).filter(row => {
              const year = parseInt(row[expectedHeaders.indexOf('Year')], 10);
              return year < 1988 || year > currentYear;
            });
  
            if (invalidYearRows.length > 0) {
              validationErrors.push('Invalid "Year" in some rows.');
            }
  
            const validMonthNames = ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'];
  
            const invalidMonthRows = this.fileData.slice(1).filter(row => {
              const month = row[expectedHeaders.indexOf('Month')];
              return !validMonthNames.includes(month);
            });
  
            if (invalidMonthRows.length > 0) {
              validationErrors.push('Invalid "Month" in some rows.');
            }
  
          } else {
            validationErrors.push('Invalid FirstName values in the file. Please upload a valid file.');
          }
        } else {
          validationErrors.push('Invalid data in numeric columns. Please upload a valid file.');
        }
      } else {
        validationErrors.push('Invalid number of columns in some rows. Please upload a valid file.');
      }
    }
  
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      this.validationMessage = validationErrors.join('<br>');
      this.showValidationMessage = true;
    } else {
      this.validationMessage = 'File is uploading';
      this.showValidationMessage = true;
  
      this.uploadFileToServer();
    }
  }
  
  

  
  
  private validateNumericColumns(data: any[][]): boolean {
    const numericColumns = ['Present Days', 'Absent Days', 'Year'];
    const expectedHeaders = ['FirstName', 'Present Days', 'Absent Days', 'Month', 'Year']; 
  
    for (const row of data) {
      for (const col of numericColumns) {
        const value = row[expectedHeaders.indexOf(col)];
        if (isNaN(value) || value === '') {
          return false; 
        }
      }
    }
  
    return true; 
  }
  

  private areHeadersValid(expectedHeaders: string[], fileHeaders: string[]): boolean {
    return JSON.stringify(expectedHeaders) === JSON.stringify(fileHeaders);
  }

  private uploadFileToServer() {
    if (!this.selectedFile) {
      console.error('No file selected. Please choose a file to upload.');
      this.validationMessage = 'No file selected. Please choose a file to upload.';
      this.showValidationMessage = true;
      return;
    }

    this.validationMessage = '';
    this.showValidationMessage = false;

    
    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.webRequestService.uploadFile(formData).subscribe(
      (response) => {
        console.log(response.message);
        this.validationMessage = 'File uploaded successfully.';
        this.showValidationMessage = true; 
        // this.selectedFile = null;
        // this.fileData = [];
        // this.employeeId = '';
      },
      (error) => {
        console.error('Error uploading file:', error);
        this.validationMessage = 'Error uploading file. Please try again.';
        this.showValidationMessage = true;
      }
    );
  }
}
    