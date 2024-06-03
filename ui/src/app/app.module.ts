import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AddComponent} from './add/add.component';
import {DonateComponent} from './donate/donate.component';
import {ContactComponent} from './contact/contact.component';
import {ReactiveFormsModule} from '@angular/forms';
import {HowItWorksComponent} from './how-it-works/how-it-works.component';
import {HttpClientModule} from '@angular/common/http';
import {ToastContainerComponent} from './common/toast-container/toast-container.component';
import {RemoveComponent} from './remove/remove.component';
import {RecaptchaModule} from 'ng-recaptcha';
import { LegalComponent } from './legal/legal.component';

@NgModule({
  declarations: [
    AppComponent,
    AddComponent,
    DonateComponent,
    ContactComponent,
    HowItWorksComponent,
    ToastContainerComponent,
    RemoveComponent,
    LegalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    HttpClientModule,
    RecaptchaModule
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule
{
}
