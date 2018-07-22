import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';

import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { BoardComponent } from './board/board.component';
import { StorageComponent } from './storage/storage.component';
import { LogoutComponent } from './logout/logout.component';
import { SearchComponent } from './search/search.component';
import { UploadComponent } from './upload/upload.component';
import { FilesizePipe } from './filesize.pipe';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { FilesService } from './files.service';
import { WebhooksComponent } from './webhooks/webhooks.component';
import { firebaseConfig } from './configs';
import { DeleteComponent } from './delete/delete.component';

const appRoutes = [
    { path: 'auth:now', component: AuthComponent, pathMatch: 'full' },
    { path: 'logout:now', component: LogoutComponent, pathMatch: 'full' },
    { path: '**', component: BoardComponent, canActivate: [AuthService] }
];

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    BoardComponent,
    StorageComponent,
    LogoutComponent,
    SearchComponent,
    UploadComponent,
    FilesizePipe,
    BreadcrumbsComponent,
    WebhooksComponent,
    DeleteComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes, { onSameUrlNavigation: 'reload'}),
    HttpClientModule,
    AngularFireModule.initializeApp(firebaseConfig.firebase),
    AngularFireDatabaseModule
  ],
  providers: [AuthService,
    FilesService,
    StorageService,
    NotificationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
