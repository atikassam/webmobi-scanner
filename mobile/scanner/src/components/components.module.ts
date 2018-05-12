import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { CommonComponent } from './common/common';
@NgModule({
	declarations: [CommonComponent]
	, imports: [
    IonicModule
  ]
	, exports: [CommonComponent]
})
export class ComponentsModule {}
