import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ToastContainerComponent} from './toast-container.component';

describe('ToastContainerComponent', () =>
{
  let component: ToastContainerComponent;
  let fixture: ComponentFixture<ToastContainerComponent>;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({
      declarations: [ ToastContainerComponent ]
    });
    fixture = TestBed.createComponent(ToastContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () =>
  {
    expect(component).toBeTruthy();
  });
});
