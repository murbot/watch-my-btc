import {Component, TemplateRef} from '@angular/core';
import {ToastService} from '../toast.service';

@Component({
  selector: 'app-toasts',
  templateUrl: './toast-container.component.html',
  styleUrls: [ './toast-container.component.scss' ],
  host: {class: 'toast-container position-fixed top-0 end-0 p-3', style: 'z-index: 1200'}
})
export class ToastContainerComponent
{
  constructor(public toastService: ToastService)
  {
  }

  isTemplate(toast: any)
  {
    return toast.textOrTpl instanceof TemplateRef;
  }
}
