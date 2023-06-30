import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RemoveComponent} from './remove.component';

describe('RemoveComponent', () =>
{
  let component: RemoveComponent;
  let fixture: ComponentFixture<RemoveComponent>;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({
      declarations: [ RemoveComponent ]
    });
    fixture = TestBed.createComponent(RemoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () =>
  {
    expect(component).toBeTruthy();
  });
});
