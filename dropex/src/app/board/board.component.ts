import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth.service';
import { StorageService } from '../storage.service';
import { FilesService } from '../files.service';

import { DbxAuth } from '../configs';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit, OnDestroy {
    public dbxAuth: DbxAuth;
    private subscription: Subscription;


    constructor(private authService: AuthService,
        private storageService: StorageService,
        private filesService: FilesService) { }

    ngOnInit() {
        this.subscription = this.authService.getAuth()
            .subscribe((auth) => this.dbxAuth = auth);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    showHome(event) {
        event.preventDefault();
        event.stopPropagation();

        // Disable all other functions (Starred - Favorites, Deletes files, Search) -- Added by K
        this.storageService.deactivateShowFavorites();
        this.storageService.deactivateShowDeletes();
        this.storageService.deactivateShowSearch();

        // Active again data stream from service
        this.filesService.getFiles('');
    }

    showFavorites(event) {
        event.preventDefault();
        event.stopPropagation();
        this.storageService.activateShowFavorites();
    }

    showDeletes(event) {
        event.preventDefault();
        event.stopPropagation();
        this.storageService.activateShowDeletes();
    }
}
