import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

const baseUrl = environment.backendUrl;

@Injectable({
  providedIn: 'root'
})
export class AlertRuleService
{
  constructor(private http: HttpClient)
  {
  }

  createAlert(request: CreateAlertRequest): Observable<CreateAlertResponse>
  {
    return this.http.post<CreateAlertResponse>(
        `${baseUrl}/alertRules`,
        request);
  }

  removeAlert(request: RemoveAlertRequest): Observable<void>
  {
    return this.http.post<void>(
        `${baseUrl}/alertRules/delete`,
        request);
  }
}

interface CreateAlertRequest
{
  email: string;
  address: string;
  label: string;
}

interface CreateAlertResponse
{
  address: string;
  balance: string;
}

interface RemoveAlertRequest
{
  email: string;
  address: string;
}
