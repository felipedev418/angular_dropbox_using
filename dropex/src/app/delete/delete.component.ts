import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Dropbox } from 'dropbox';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
import { DbxAuth } from '../configs';
import { Router, Routes } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FilesService } from './../files.service';

import { StorageComponent } from '../storage/storage.component';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.css']
})
export class DeleteComponent implements OnInit, OnDestroy {
  @Input() path: string;
  @Input() filename: string;

  private subscription: Subscription;
  private dbxAuth: DbxAuth;
  dropDown = false;


  constructor(private http: HttpClient,
              private authService: AuthService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private filesService: FilesService,
              private storage: StorageComponent) { }

  ngOnInit() {
    this.subscription = this.authService.getAuth()
                            .subscribe((auth) => this.dbxAuth = auth);
  }


  delete(event) {
    event.preventDefault();
        this.filesService.deleteFile(this.path);
  }
  download(event) {
    event.preventDefault();
    this.storage.downloadFile(this.path, this.filename, event);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
}

}
