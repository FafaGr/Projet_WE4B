import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ConnexionComponent} from "./sign-in/connexion/connexion.component";
import {HomepageComponent} from "./home/homepage/homepage.component";
import {InscriptionComponent} from "./sign-up/inscription/inscription.component";

const routes: Routes = [
  {path:'connexion', component: ConnexionComponent},
  {path:'',component: HomepageComponent},
  {path:'inscription',component: InscriptionComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
