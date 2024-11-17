import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class WebRequestService {
  
  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) {}

  // Sharing EmailId from login page to Change password page
  private userEmailSource = new BehaviorSubject<string | null>(null);
  currentUserEmail:  Observable<string | null> = this.userEmailSource.asObservable();

  setUserEmail(email: string | null) {
    this.userEmailSource.next(email);
  }


  loginUser(credentials: { EmailId: any; Password: any }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  comparePassword(credentials: { EmailId: any; Password: any }): Observable<any> {
    return this.http.post(`${this.apiUrl}/compare-password`, credentials);
  }

  checkEmailExists(EmailId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/checkEmailExists?email=${EmailId}`);
  }

  sendPasswordByEmail(payload: { to: string; subject: string; text: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/sendPasswordByEmail`, payload);
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { email, newPassword });
  }
  




  getUserDataByEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getUserDataByEmail?email=${email}`);
  }
   
  updateUserPassword(employeeId: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update-password`, { employeeId, newPassword });
  }

  compareCurrentPassword(employeeId: number, currentPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/compare-current-password`, { employeeId, currentPassword });
  }

  getUserInfo(): Observable<any> {
    const email = localStorage.getItem('userEmail'); 
    if (!email) {
      throw new Error('User email not found in local storage');
    }
    return this.http.get(`${this.apiUrl}/getUserInfo?email=${email}`);
  }

  setUsername(email: string) {
    localStorage.setItem('userEmail', email); 
  }
  
  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  getEmployees(params: any): Observable<any[]> {
    const options = { params: new HttpParams({ fromObject: params }) };
    return this.http.get<any[]>(`${this.apiUrl}/employees`, options);
  }

  getEmployeesByID(params: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/employeesByID`, { params });
  }
  
  getEmployeeDetails(FirstName: string, MiddleName: string, LastName: string, Department: string): Observable<any> {
    const url = `${this.apiUrl}/employee-detail`;
    const params = { FirstName, MiddleName, LastName, Department };
    return this.http.get(url, { params });
  }
  
  updateEmployee(employeeId: number, data: any): Observable<any> {
    const url = `${this.apiUrl}/update-employee/${employeeId}`;
    return this.http.put(url, data);
  }

  deleteEmployee(employeeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${employeeId}`);
  }

  registerEmployee(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/newRegister`, userData);
  }


  uploadFile(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/uploadAndRegister`, formData);
  }

  getAttendanceData(firstName: string, month: number, year: number): Observable<any[]> {
    const params = new HttpParams()
      .set('firstName', firstName)
      .set('month', month.toString())
      .set('year', year.toString());

    return this.http.get<any[]>(`${this.apiUrl}/attendance`, { params });
  }
}
