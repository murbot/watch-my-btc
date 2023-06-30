import {Component} from '@angular/core';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-donate',
  templateUrl: './donate.component.html',
  styleUrls: [ './donate.component.scss' ]
})
export class DonateComponent
{
  readonly donateBitcoinAddress = environment.donateBitcoinAddress;
  readonly donateLightningAddress = environment.donateLightningAddress;
}
