import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Dropbox } from 'dropbox';

import { NotificationService } from '../notification.service'; // -- new import by K
import { AuthService } from '../auth.service';
import { FilesService } from '../files.service';
import { StorageService } from '../storage.service';
import { DbxAuth } from '../configs';
import { LocalStorageMethods, UrlMethods } from '../utils';

// import { SearchComponent } from '../search/search.component'; Deleted by K
@Component({
    selector: 'app-storage',
    templateUrl: './storage.component.html',
    styleUrls: ['./storage.component.css']
})
export class StorageComponent implements OnInit, OnDestroy {
    private hasChanged = false; // -- new property by K --
    private currentUrl = ''; // -- new property by K --
    public path;
    public storageSpace;
    public usedSpace;
    public spacePercentage;
    private starredItems = [];
    public inEntries: Array<any> = [];
    public lastSearch: Array<any> = []; // Modified by K
    private dbxAuth: DbxAuth;
    private dbxAuthSubscription: Subscription;
    private fileStreamSubscription: Subscription;
    private compEntries: Array<any> = [];
    private dbxConnection;

    private showFavorites = false;
    private showFavoritesSubscription: Subscription;
    private showDeletes = false;
    private showDeletesSubscription: Subscription;

    public showSearch = false;
    private showSearchSubscription: Subscription;

    constructor(private authService: AuthService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private filesService: FilesService,
        private storageService: StorageService,
        private notificationService: NotificationService) { } // -- new service by K --
    ngOnInit() {
        this.dbxAuthSubscription = this.authService
            .getAuth()
            .subscribe(auth => (this.dbxAuth = auth));

        this.dbxConnection = new Dropbox({ accessToken: this.dbxAuth.accessToken });

        this.activatedRoute.url.subscribe(() => {
            this.currentUrl = UrlMethods.decodeWithoutParams(this.router.url);
            this.filesService.getFiles(this.currentUrl);
            console.log('Current URL', this.currentUrl);
        });

        this.fileStreamSubscription = this.filesService.stream
            .subscribe((entries) => {
                this.updateFileStream(entries);
            });

        this.showFavoritesSubscription = this.storageService.showFavorites()
            .subscribe((status) => {
                this.showFavorites = status;
                console.log('showFavorites', this.showFavorites);
                if (status) {
                    const results = this.filesService.favaritesResults();
                    this.showCustomData(results);
                }
            });

        this.showDeletesSubscription = this.storageService.showDeletes()
            .subscribe((status) => {
                this.showDeletes = status;
                console.log('showDeletes', this.showDeletes);
                if (status) {
                    const data = this.filesService.deletedData();
                    this.showCustomData(data); // Continue code for this function here<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
                }
            });

        // Added by K
        this.showSearchSubscription = this.storageService.showSearch()
            .subscribe((status) => {
                this.showSearch = status;
                console.log('showSearch', this.showSearch);
                if (status) {
                    const results = this.filesService.searchResults();
                    this.showCustomData(results);
                }
            });

        // New code to auto rerender this component
        this.notificationService.updateCurrentPath(this.currentUrl);
        this.notificationService.checkHasChange()
            .subscribe(changed => {
                this.hasChanged = changed;
                this.checkHasChanged();
            });
        // -- End new --

    }

    // New method to auto rerender this component
    checkHasChanged() {
        if (this.hasChanged) {
            console.log('reload now', this.compEntries, this.currentUrl);
            this.filesService.getFiles(this.currentUrl);
            this.notificationService.hasReRendered(); // report to service that this component has rerendered
        } else {
            console.log('nothing now', this.currentUrl);
        }
    }
    // -- End new --

    updateFileStream(inData: Array<any>) {
        if (!this.showFavorites && !this.showSearch && !this.showDeletes) {
            this.compEntries = inData;
            this.getData();
            this.renderData(this.compEntries);
            console.log('compEntries: ', this.compEntries);
        }
    }

    showCustomData(inData: Array<any>) {
        if (this.showFavorites) {
            this.renderData(inData);
            this.storageService.deactivateShowFavorites();
        } else if (this.showSearch) {
            this.renderData(inData);
            this.storageService.deactivateShowSearch();
        } else if (this.showDeletes) {
            console.log('Show all deleted files or folders here');
            // code to render data here<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
            const objDeleteArr: Array<any> = [];
            inData.forEach(name => {
                objDeleteArr.push({
                    name: name,
                    path_lower: ''
                });
            });
            this.renderData(objDeleteArr);
            this.storageService.deactivateShowDeletes();
        }
    }

    getData() {
        this.dbxConnection
            .usersGetSpaceUsage(null)
            .then(spaceInfo => {
                console.log(spaceInfo);
                this.storageSpace = (spaceInfo.allocation.allocated / 1024 / 1024 / 1024).toFixed(2);
                this.usedSpace = (spaceInfo.used / 1024 / 1024 / 1024).toFixed(2);
                this.spacePercentage = (this.usedSpace / this.storageSpace) * 100;
                console.log(this.spacePercentage);
            })
            .catch(error => {
                console.log(error);
            });
    }

    downloadFile(filepath, filename, event) {
        event.preventDefault();
        this.dbxConnection
            .filesDownload({ path: filepath })
            .then(data => {
                console.log(data);
                const fileurl = URL.createObjectURL((<any>data).fileBlob);
                const a = document.createElement('a');
                if (this.isImage(data.path_lower)) {
                    console.log('is image');
                }
                a.setAttribute('href', fileurl);
                a.setAttribute('download', filename);
                a.click();
            })
            .catch((error) => {
                console.log(error);
            });
    }

    // Get latest search results -- Added by K
    retrieveLatestSearch() {
        const numberOfSearchResults = 3; // You decide yourself how many you want
        let searchResults = this.filesService.searchResults();
        const arrLength = searchResults.length;
        if (arrLength > 0) {
            if (arrLength > numberOfSearchResults) {
                searchResults = searchResults.slice(0, numberOfSearchResults);
            }
            this.lastSearch = searchResults;
        }
    }

    renderData(inEntries: Array<any>) {
        /* Run HERE this method to retrieve exactly the latest search results
           before you render data */
        this.retrieveLatestSearch();

        // You can use the latest results by using this.lastSearch
        console.log('The latest search results', this.lastSearch);

        console.log('render', inEntries);
        if (inEntries.length > 0) {
            if (LocalStorageMethods.retrieve('entries') !== null) {
                for (let i = 0; i < inEntries.length; i++) {
                    inEntries[i].starred = checkStars(inEntries[i]);
                }
            } else {
                for (const entry of inEntries) {
                    entry.starred = false;
                }
            }

            for (const entry of inEntries) {
                if (this.isImage(entry.path_lower)) {
                    this.dbxConnection
                        .filesGetThumbnail({ path: entry.path_lower })
                        .then((result) => {
                            const fileUrl = URL.createObjectURL((<any>result).fileBlob);
                            console.log('File URL', fileUrl); // Added by K for testing
                            document
                                .getElementById(entry.path_lower)
                                .setAttribute('src', fileUrl);
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
            }
        }
        this.inEntries = inEntries;
    }

    isImage(fileName: string) {
        if (fileName !== '' && fileName.length > 4) { // Fixed bug by K
            const supportedImages = ['jpg', 'jpeg', 'png', 'tiff', 'tif', 'gif', 'bmp'];
            const fileEnding = fileName.split('.').pop();
            if (supportedImages.some(imgType => imgType === fileEnding)) {
                return true;
            }
        }
        return false;
    }

    getFileType(fileName: string) {
        if (fileName !== '' && fileName.length > 4) { // Fixed bug by K
            const fileEnding = fileName.split('.').pop();
            let fileType = ''; // Fixed bug by K
            switch (fileEnding) {
                case 'pdf':
                    fileType = 'fas fa-file-pdf fa-2x';
                    break;
                case 'docx' || 'docx':
                    fileType = 'fas fa-file-word fa-2x';
                    break;
                case 'pptx':
                    fileType = 'fas fa-file-powerpoint fa-2x';
                    break;
                case 'xlsx':
                    fileType = 'fas fa-file-excel fa-2x';
                    break;
                case 'html' || 'js':
                    fileType = 'fas fa-file-code fa-2x';
                    break;
                default:
                    fileType = 'fa fa-file fa-2x';
            }
            return fileType;
        }
        return false;
    }

    addStar(id, event) {
        event.preventDefault();
        this.starredItems = LocalStorageMethods.retrieve('entries') || [];
        const foundItem = this.compEntries.find(item => item.id === id) || {};
        if (foundItem) {
            foundItem.starred = true;
            this.starredItems.push(foundItem);
            LocalStorageMethods.store('entries', this.starredItems);
        }
    }

    delStar(id, event) {
        event.preventDefault();

        // Clear item in this.inEntries
        const foundItem = this.inEntries.find(item => item.id === id);
        if (foundItem) { // Fixed bug by K
            foundItem.starred = false;
        }

        // Clear item in localStorage
        this.starredItems = LocalStorageMethods.retrieve('entries') || [];
        this.starredItems = this.starredItems.filter(el => el.id !== id);

        // Store back to localStorage
        LocalStorageMethods.store('entries', this.starredItems);
    }

    ngOnDestroy() {
        this.dbxAuthSubscription.unsubscribe();
        this.fileStreamSubscription.unsubscribe();
        this.showFavoritesSubscription.unsubscribe();
        this.showDeletesSubscription.unsubscribe();
        this.showSearchSubscription.unsubscribe();
    }
}

function checkStars(inItem: any) {
    const currentStartItems = LocalStorageMethods.retrieve('entries') || [];
    const results = currentStartItems.filter(item => item.id === inItem.id) || [];

    return results.length > 0 ? true : false;
}
