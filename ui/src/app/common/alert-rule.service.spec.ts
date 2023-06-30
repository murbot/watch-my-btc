import {TestBed} from '@angular/core/testing';

import {AlertRuleService} from './alert-rule.service';

describe('AlertRuleService', () =>
{
  let service: AlertRuleService;

  beforeEach(() =>
  {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertRuleService);
  });

  it('should be created', () =>
  {
    expect(service).toBeTruthy();
  });
});
