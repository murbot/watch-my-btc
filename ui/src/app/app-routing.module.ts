import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AddComponent} from './add/add.component';
import {ContactComponent} from './contact/contact.component';
import {DonateComponent} from './donate/donate.component';
import {HowItWorksComponent} from './how-it-works/how-it-works.component';
import {RemoveComponent} from './remove/remove.component';

const routes: Routes = [
  {
    path: 'add',
    component: AddComponent
  },
  {
    path: 'remove',
    component: RemoveComponent
  },
  {
    path: 'donate',
    component: DonateComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'how-it-works',
    component: HowItWorksComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'add'
  },
  {
    path: '**',
    redirectTo: 'add'
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule
{
}
