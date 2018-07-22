import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Dropbox } from 'dropbox';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { StorageService } from '../storage.service';
import { DbxAuth } from '../configs';
import { LocalStorageMethods } from '../utils';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {
  public compMatches = [];
  private dbxAuth: DbxAuth;
  private subscription: Subscription;
  public query;
  public matches = 0;
  public gotMatch = false;
  question;
  lastItem = [];
  lastSearch;
  showLastSearch = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.subscription = this.authService
      .getAuth()
      .subscribe(auth => (this.dbxAuth = auth));
  }

  search(event) {
    this.router.navigate(['?search']); // Edited by K
    let httpOptions;
    httpOptions = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.dbxAuth.accessToken,
        'Content-Type': 'application/json'
      })
    };
    this.question = this.query;

    const payload = {
      path: '',
      query: this.query,
      mode: 'filename_and_content'
    };

    const tmp = this.http.post(
      'https://api.dropboxapi.com/2/files/search',
      payload,
      httpOptions
    );
    tmp.subscribe(
      (results: any) => {
        console.log(results);
        this.getMatches(results.matches);
        const numbers = results.matches.length;
        this.matches = numbers;
        this.gotMatch = true;
      },
      error => {
        console.error('error', error);
      }
    );
    setTimeout(() => {
      this.gotMatch = false;
    }, 3000);
    return tmp;
  }

  getMatches(obj: Array<any>) {
    this.compMatches = obj;
    // console.log(this.compMatches); // Deleted by K
    const save = this.compMatches;
    save.forEach(function(e) {
      e.searchterm = this.question;
    }, this);
    console.log('save', save);
    sessionStorage.setItem('lastSearches', JSON.stringify(save));

    // Added by K
    if (obj.length > 0) {
      this.storeSearchResults(obj);
    }
  }

  // New method added by K
  storeSearchResults(inData: Array<any>) {
    console.log(inData);
    const arrLength = inData.length;
    let storedArray = [];
    for (let i = 0; i < arrLength; i++) {
      // Data structure changed
      const newObjArr = [
        {
          ...inData[i].metadata,
          searchterm: inData[i].searchterm
        }
      ];
      storedArray = storedArray.concat(newObjArr);
    }
    LocalStorageMethods.store('search-results', storedArray);
    this.storageService.activateShowSearch();
  }

  // Don't use in the future
  downloadFile(filepath, filename, event) {
    event.preventDefault();
    const dbx = new Dropbox({ accessToken: this.dbxAuth.accessToken });

    dbx
      .filesDownload({ path: filepath })
      .then(data => {
        console.log(data);
        const fileurl = URL.createObjectURL((<any>data).fileBlob);
        const a = document.createElement('a');
        a.setAttribute('href', fileurl);
        a.setAttribute('download', filename);
        a.click();
      })
      .catch(error => {
        console.log(error);
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
