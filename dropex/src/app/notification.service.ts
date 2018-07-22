import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notifications: Array<any> = [];
    private objObservable: any;
    private objObserver: any;

    private changes: Array<any> = [];
    private changeObservable: any;
    private changeObserver: any;

    // For storage.comp
    private currentPath: String;
    private changePath: String;
    private hasChange = false;
    private hasChangeBehavior: BehaviorSubject<any>;

    constructor() {
        this.objObservable = new Observable((generatedObserver) => {
            this.objObserver = generatedObserver;
            this.objObserver.next(this.notifications);
        });

        this.changeObservable = new Observable((localObserver) => {
            this.changeObserver = localObserver;
            this.changeObserver.next(this.changes);
        });

        this.hasChangeBehavior = new BehaviorSubject(this.hasChange);
    }

    // NOTIFICATION methods
    getNotifications(): Observable<any> {
        return this.objObservable;
    }

    storeNotification(newNotification: Array<any>) {
        this.notifications = this.notifications.concat(newNotification);
        return this.objObserver.next(this.notifications);
    }

    clearNotification(inId: Number) {
        this.notifications = this.notifications.filter((item) => item.id !== inId);
        return this.objObserver.next(this.notifications);
    }

    // CHANGE methods
    getChanges(): Observable<any> {
        return this.changeObservable;
    }

    storeChange(objMessage) {
        this.changes = [...this.changes, objMessage];
        return this.changeObserver.next(this.changes);
    }

    clearChange(cursor: String) {
        this.changes = this.changes.filter((item) => item.cursor !== cursor);
        return this.changeObserver.next(this.changes);
    }

    // For STORAGE.comp
    checkHasChange(): BehaviorSubject<any> {
        return this.hasChangeBehavior;
    }

    hasReRendered() {
        this.hasChange = false;
        return this.hasChangeBehavior.next(this.hasChange);
    }
    updateCurrentPath(fullPath: String) {
        if (fullPath === '/') {
            fullPath = '';
        }
        this.currentPath = fullPath;
    }

    updateChangePath(fullPath: String) {
        if (fullPath === '/') {
            fullPath = '';
        }
        this.changePath = fullPath;

        if (this.changePath === this.currentPath) {
            this.hasChange = true;
            return this.hasChangeBehavior.next(this.hasChange);
        }
        return false;
    }
}
