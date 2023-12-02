import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent {
  constructor(private breadcrumbService: BreadcrumbService,
    private route: ActivatedRoute){}

  ngOnInit(){
    this.breadcrumbService.setActiveRoute(this.route);
  }
}
