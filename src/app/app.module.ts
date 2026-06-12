import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { BottomBarComponent } from './bottom-bar/bottom-bar.component';
import { BannerBgComponent } from './home/banner-bg/banner-bg.component';
import { FilterSecComponent } from './home/filter-sec/filter-sec.component';
import {FormsModule} from "@angular/forms";
import { GamesGridComponent } from './home/games-grid/games-grid.component';
import { ConnexionFormComponent } from './sign-in/connexion-form/connexion-form.component';
import { ConnexionComponent } from './sign-in/connexion/connexion.component';
import { HomepageComponent } from './home/homepage/homepage.component';
import { InscriptionComponent } from './sign-up/inscription/inscription.component';
import { InscriptionFormComponent } from './sign-up/inscription-form/inscription-form.component';

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    BottomBarComponent,
    BannerBgComponent,
    FilterSecComponent,
    GamesGridComponent,
    ConnexionFormComponent,
    ConnexionComponent,
    HomepageComponent,
    InscriptionComponent,
    InscriptionFormComponent
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
