import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { BottomBarComponent } from './bottom-bar/bottom-bar.component';
import { BannerBgComponent } from './banner-bg/banner-bg.component';
import { FilterSecComponent } from './filter-sec/filter-sec.component';
import {FormsModule} from "@angular/forms";
import { GamesGridComponent } from './games-grid/games-grid.component';

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    BottomBarComponent,
    BannerBgComponent,
    FilterSecComponent,
    GamesGridComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
