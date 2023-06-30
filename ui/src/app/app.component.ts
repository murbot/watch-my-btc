import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {filter} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})
export class AppComponent implements OnInit
{
  private form: FormGroup;

  navLinks = [
    {
      label: 'Add',
      path: '/add',
      active: false
    },
    {
      label: 'Remove',
      path: '/remove',
      active: false
    },
    {
      label: 'How It Works',
      path: '/how-it-works',
      active: false
    },
    {
      label: 'Donate',
      path: '/donate',
      active: false
    },
    {
      label: 'Contact',
      path: '/contact',
      active: false
    }
  ];

  constructor(
      private route: ActivatedRoute,
      private router: Router,
      private formBuilder: FormBuilder)
  {
    this.form = new FormGroup({
      email: new FormControl<string>(''),
      address: new FormControl<string>('', [ Validators.required, Validators.email ])
    })
  }

  ngOnInit(): void
  {
    this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
    )
        .subscribe(value =>
        {
          console.debug(`NavigationEnd: ${JSON.stringify((value as NavigationEnd).urlAfterRedirects)}`);

          this.navLinks.forEach(navLink =>
          {
            navLink.active = (value as NavigationEnd).urlAfterRedirects.startsWith(navLink.path);
          })
        });


    this.route.paramMap
        .subscribe(params =>
        {
          const emailParam = params.get('email');
          const addressParam = params.get('addressParam');


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

}
