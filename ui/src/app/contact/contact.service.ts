import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

const baseUrl = 'https://api.watchmybtc.com';

@Injectable({
  providedIn: 'root'
})
export class ContactService
{

  constructor(private http: HttpClient)
  {
  }

  contactUs(request: ContactUsRequest): Observable<void>
  {
    return this.http.post<void>(
        `${baseUrl}/contactUs`,
        request);
  }
}

interface ContactUsRequest
{
  email: string;
  message: string;
}
