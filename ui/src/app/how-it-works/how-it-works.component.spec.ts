import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HowItWorksComponent} from './how-it-works.component';

describe('HowItWorksComponent', () =>
{
  let component: HowItWorksComponent;
  let fixture: ComponentFixture<HowItWorksComponent>;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({
      declarations: [ HowItWorksComponent ]
    });
    fixture = TestBed.createComponent(HowItWorksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () =>
  {
    expect(component).toBeTruthy();
  });
});
