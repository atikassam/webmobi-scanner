import { Component, Input } from '@angular/core';

/**
 * Generated class for the CommonComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'common',
  templateUrl: 'common.html'
})
export class CommonComponent {
  @Input() view_type;
  @Input() view_logo;
  @Input() view_title;
  @Input() view_subtitle;
  @Input() view_buttons;

  constructor() { }

}
