import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ContactService} from './contact.service';
import {catchError, EMPTY} from 'rxjs';
import {ToastService} from '../common/toast.service';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: [ './contact.component.scss' ]
})
export class ContactComponent
{
  readonly recaptchaSiteKey = environment.recaptchaSiteKey;
  form: FormGroup;

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private formBuilder: FormBuilder,
      private contactService: ContactService,
      private toastService: ToastService)
  {
    this.form = new FormGroup({
      email: new FormControl<string>('', [ Validators.required, Validators.email ]),
      message: new FormControl<string>('', [ Validators.required, Validators.minLength(10), Validators.maxLength(1000) ]),
      captcha: new FormControl<boolean>(false, [ Validators.requiredTrue ])
    })
  }

  ngOnInit(): void
  {
  }

  get email(): FormControl<string>
  {
    return this.form.get('email') as FormControl<string>;
  }

  get message(): FormControl<string>
  {
    return this.form.get('message') as FormControl<string>;
  }

  get captcha(): FormControl<boolean>
  {
    return this.form.get('captcha') as FormControl<boolean>;
  }

  submit()
  {
    this.contactService.contactUs({
      email: this.email.value,
      message: this.message.value
    })
        .pipe(
            catchError(err =>
                {
                  console.log(err);
                  alert(`Sorry but an error has occurred: ${err.message}`);
                  return EMPTY;
                }
            ))
        .subscribe(response =>
        {
          console.log(`Success: ${response}`);
          this.toastService.showSuccess('Message sent successfully');
          this.router.navigate([ '/home' ]);
        });
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
