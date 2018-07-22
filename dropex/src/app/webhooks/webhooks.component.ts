import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';
import { AngularFireDatabase } from 'angularfire2/database';

import { AuthService } from '../auth.service';
import { NotificationService } from '../notification.service';
import { dropboxApi, DbxAuth, firebaseConfig } from '../configs';

@Component({
    selector: 'app-webhooks',
    templateUrl: './webhooks.component.html',
    styleUrls: ['./webhooks.component.css']
})
export class WebhooksComponent implements OnInit, OnDestroy {
    private dbxAuth: DbxAuth;
    private data: Observable<any[]>;

    private compNotifications = [];
    private compChanges = [];
    private subscription: Subscription;
    private notiSubscription: Subscription;
    private changeSubscription: Subscription;

    public message = ''; // Using public scope to display a message
    private latestCursor = ''; // The latest cursor stored always

    constructor(private notificationService: NotificationService,
                private http: HttpClient,
                private db: AngularFireDatabase,
                private authService: AuthService) {}

    ngOnInit() {
        this.subscription = this.authService.getAuth()
                                .subscribe((auth) => this.dbxAuth = auth);

        this.notiSubscription = this.notificationService.getNotifications()
            .subscribe((notifications) => {
                this.compNotifications = notifications;
            });

        this.changeSubscription = this.notificationService.getChanges()
            .subscribe((changes) => {
                this.compChanges = changes;
            });

        this.requestLatestCursor();
        this.data = this.streamDatabase(firebaseConfig.listPath,
                                        firebaseConfig.orderBy,
                                        this.dbxAuth.accountId);
        this.getNotificationsFromDb();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.notiSubscription.unsubscribe();
        this.changeSubscription.unsubscribe();
    }

    // STREAM DATA
    streamDatabase(listPath, orderByVal, equalVal): Observable<any[]> {
        return this.db.list(listPath, ref => ref.orderByChild(orderByVal)
                                                .equalTo(equalVal))
                      .snapshotChanges();
    }

    // ------ NOTIFICATIONS ------
    getNotificationsFromDb() {
        return this.data.subscribe(
            (snapshot) => {
                const documents = snapshot.map((child) => ({docId: child.payload.key, ...child.payload.val()})) || [];
                this.storeNotifications(documents);
            }, (error) => {
                console.log(error);
            }
        );
    }

    storeNotifications(inData: Array<any>) {
        // All new notifications stored into app storage by NotificationService
        if (inData.length > 0) {
            this.notificationService.storeNotification(inData);
            this.processNotifications();
        }
    }

    processNotifications() {
        if (this.compNotifications.length > 0) {
            const arrProcess = this.compNotifications; // Stored in a temp array
            const arrLength = arrProcess.length;
            for (let i = 0; i < arrLength; i++) {
                // Delay process in 0.5s for every step of for loop
                const delayProcess = (index) => {
                    return () => {
                        // Get all new changes from the last point on Dropbox API
                        this.requestChangedInfo();

                        // Clear a notification in database and app storage
                        // -Database
                        console.log(arrProcess[index]);
                        this.db.list(firebaseConfig.listPath + '/' + arrProcess[index].docId).remove();

                        // -App storage
                        this.notificationService.clearNotification(arrProcess[index].id);
                    };
                };
                setTimeout(delayProcess(i), 1000 * i);
            }
        }
    }

    // ------ TRACKING CHANGES FROM THE LAST POINT ------
    requestLatestCursor() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Authorization': 'Bearer ' + this.dbxAuth.accessToken,
                'Content-Type': 'application/json',
            })
        };
        const payload = {
            'path': '',
            'recursive': true,
            'include_deleted': false,
            'include_media_info': false,
            'include_has_explicit_shared_members': false,
            'include_mounted_folders': false,
        };
        const makePost = this.http.post(dropboxApi.filesListFolderGetLatestCursor, payload, httpOptions);
        makePost.subscribe(
            (results: any) => {
                if (results !== {}) {
                    this.latestCursor = results.cursor;
                }
            }, (error) => { console.log(error); }
        );
    }

    requestChangedInfo() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Authorization': 'Bearer ' + this.dbxAuth.accessToken,
                'Content-Type': 'application/json',
            })
        };
        const payload = { 'cursor': this.latestCursor };
        const makePost = this.http.post(dropboxApi.filesListFolderContinue, payload, httpOptions);
        makePost.subscribe(
            (results: any) => {
                // Get all changes
                if (!results.has_more) {
                    // All new changes will be saved as soon as possible in app storage
                    this.notificationService.storeChange(results);

                    // Begin notification process
                    this.processChangedInfo();

                    // Request again the latest cursor to make new point for tracking changes
                    this.requestLatestCursor();
                }
            }, (error) => { console.log(error); }
        );
    }

    processChangedInfo() {
        console.log('All new changes', this.compChanges);
        // Get all changes from the app store
        if (this.compChanges.length > 0) {
            const arrProcess = this.compChanges; // Stored in a temp array
            const arrLength = arrProcess.length;
            for (let i = 0; i < arrLength; i++) {
                this.showMessages(arrProcess[i]); // Get a change (an object) in array and show it to the end-user
            }
        }
    }

    showMessages(results: any) {
        // Delay 3.5s for every time to process a step within for loop
        // Delay 3s for every time to display a message
        if (results !== {} && results.entries.length > 0) {
            const arrLength = results.entries.length;
            for (let i = 0; i < arrLength; i++) {
                const delayShow = (index) => {
                    return () => {
                        const entry = results.entries[index];

                        this.showAMessage(entry); // Show a message
                        this.processChangedLocation(entry); // Using for storage.component to process the changed location
                        this.notificationService.clearChange(results.cursor); // A change cleared in app storage
                    };
                };
                setTimeout(delayShow(i), 3500 * i);
            }
        }
    }

    showAMessage(entry: any) {
        let message = '';

        switch (entry['.tag']) {
            case 'deleted':
                message = entry.name + ' deleted successfully';
                break;
            case 'file':
                if (entry.client_modified === entry.server_modified) {
                    message = entry.name + ' added successfully';
                } else {
                    message = 'You have a new change with this ' +
                                entry['.tag'] + ' ' +
                                entry.name;
                }
                break;
            default:
                message = 'You have a new change with this ' +
                            entry['.tag'] + ' ' +
                            entry.name;
                break;
        }

        this.message = message;
        setTimeout(() => { this.message = ''; }, 3000);
    }

    // Rerender storage.component if the change found in current location
    processChangedLocation(entry: any) {
        let changePath = '';
        switch (entry['.tag']) {
            case 'deleted':
                const delArray = entry.path_lower.split('/');
                const findFileType = delArray[delArray.length - 1].split('.');
                if (findFileType.length > 1) { // It is a file
                    changePath = delArray.slice(0, delArray.length - 1).join('/');
                } else { // It is a folder
                    changePath = delArray.slice(0, delArray.length - 1).join('/');
                }
                break;

            case 'file':
                const fileArray = entry.path_lower.split('/');
                changePath = fileArray.slice(0, fileArray.length - 1).join('/');
                break;

            case 'folder':
                const folderArray = entry.path_lower.split('/');
                changePath = folderArray.slice(0, folderArray.length - 1).join('/');
                break;

            default:
                break;
        }

        this.notificationService.updateChangePath(changePath); // Update changed path into service
    }
}
