import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {ToastService} from '../common/toast.service';
import {AlertRuleService} from '../common/alert-rule.service';
import {catchError, EMPTY} from 'rxjs';
import {ErrorUtils} from '../common/error-utils';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-main',
  templateUrl: './add.component.html',
  styleUrls: [ './add.component.scss' ]
})
export class AddComponent implements OnInit
{
  readonly recaptchaSiteKey = environment.recaptchaSiteKey;
  form: FormGroup;

  constructor(
      private route: ActivatedRoute,
      private toastService: ToastService,
      private mainService: AlertRuleService)
  {
    this.form = new FormGroup({
      email: new FormControl<string>('', [ Validators.required, Validators.email ]),
      address: new FormControl<string>('', [ Validators.required, Validators.minLength(14), Validators.maxLength(74) ]),
      label: new FormControl<string>('', [ Validators.required, Validators.minLength(1), Validators.maxLength(100) ]),
      captcha: new FormControl<boolean>(false, [ Validators.requiredTrue ])
    })
  }

  ngOnInit(): void
  {
    this.route.queryParamMap
        .subscribe(params =>
        {
          console.debug(`params: ${JSON.stringify(params)}`);

          const emailParam = params.get('email');
          const addressParam = params.get('address');

          if (emailParam != null)
          {
            this.email.setValue(emailParam);
          }
          if (addressParam != null)
          {
            this.address.setValue(addressParam);
          }
        });
  }

  get email(): FormControl<string>
  {
    return this.form.get('email') as FormControl<string>;
  }

  get address(): FormControl<string>
  {
    return this.form.get('address') as FormControl<string>;
  }

  get label(): FormControl<string>
  {
    return this.form.get('label') as FormControl<string>;
  }

  get captcha(): FormControl<boolean>
  {
    return this.form.get('captcha') as FormControl<boolean>;
  }

  createAlert(): void
  {
    try
    {
      this.form.disable();
      this.mainService.createAlert({
        email: this.email.value,
        address: this.address.value,
        label: this.label.value
      })
          .pipe(
              catchError(err =>
              {
                this.toastService.showError(ErrorUtils.parseError(err));
                this.form.enable();
                return EMPTY;
              }))
          .subscribe(response =>
          {
            this.toastService.showSuccess(`Alert Added. Current balance: ${response.balance}`);
            this.form.enable();
            this.address.reset('');
            this.label.reset('');
          });
    } catch (err)
    {
      console.error(err);
      this.form.enable();
    }
  }

  captchaResolved($event: string)
  {
    console.debug(`Resolved captcha with response: ${$event}`);
    this.captcha.setValue(true);
  }

  captchaErrored(errorDetails: any)
  {
    console.error(`Error: ${JSON.stringify(errorDetails)}`);
    this.captcha.setValue(false);
  }
}
