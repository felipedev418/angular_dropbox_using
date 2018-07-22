import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Dropbox } from 'dropbox';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AuthService } from '../auth.service';
import { DbxAuth } from '../configs';
import { NullTemplateVisitor } from '@angular/compiler';
import { UrlMethods } from '../utils';
import { FilesService } from '../files.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})



export class UploadComponent implements OnInit {
    private dbxAuth: DbxAuth;
    private subscription: Subscription;

     files;
     filename = {
      name: ''
     };

    constructor(private authService: AuthService,
                private http: HttpClient,
                private router: Router,
                private filesService: FilesService) { }

  ngOnInit() {
    this.subscription = this.authService.getAuth()
                                        .subscribe((auth) => this.dbxAuth = auth);
      if (!this.dbxAuth.isAuth) {
           this.router.navigate(['/auth']);
                }
            }



  storeFiles(files) {
    this.files = files;
    this.upload();
  }

  upload() {
   // const filepath  = this.dropexService.getCurrentPath();
    const filepath = UrlMethods.decodeWithoutParams(this.router.url);
    console.log('provar med detta', filepath);
    /*  */
    const name = this.filename.name.split('\\').pop();
    const arg = {
      path: filepath + '/' + name,
      mode: 'add',
      autorename: true,
      mute: false
      };

      let httpOptions;
          httpOptions = {
          headers: new HttpHeaders({
              'Authorization': 'Bearer ' + this.dbxAuth.accessToken,
              'Dropbox-API-Arg': JSON.stringify(arg),
              'Content-Type': 'application/octet-stream'
          })
        };

        console.log(httpOptions);
          const send = this.http.post('https://content.dropboxapi.com/2/files/upload', this.files.item(0), httpOptions);
          send.subscribe((results: any) => {
            this.filesService.getFiles(filepath);
            alert('Your upload was successfull.');
       },
        error => {
          console.error('error', error);
        });
        return send;

    }
}
