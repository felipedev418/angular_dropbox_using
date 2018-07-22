import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private favorites = false;
    private favoritesBehavior: BehaviorSubject<any>;

    private deletes = false;
    private deletesBehavior: BehaviorSubject<any>;

    private search = false;
    private searchBehavior: BehaviorSubject<any>;

    constructor() {
        this.favoritesBehavior = new BehaviorSubject(this.favorites);
        this.deletesBehavior = new BehaviorSubject(this.deletes);
        this.searchBehavior = new BehaviorSubject(this.search);
    }

    // Using for "Starred" function
    showFavorites(): BehaviorSubject<any> {
        return this.favoritesBehavior;
    }

    activateShowFavorites() {
        this.favorites = true;
        return this.favoritesBehavior.next(this.favorites);
    }

    deactivateShowFavorites() {
        this.favorites = false;
        return this.favoritesBehavior.next(this.favorites);
    }

    // Using for "Deletes files" function
    showDeletes(): BehaviorSubject<any> {
        return this.deletesBehavior;
    }

    activateShowDeletes() {
        this.deletes = true;
        return this.deletesBehavior.next(this.deletes);
    }

    deactivateShowDeletes() {
        this.deletes = false;
        return this.deletesBehavior.next(this.deletes);
    }

    // Using for "Search" function
    showSearch(): BehaviorSubject<any> {
        return this.searchBehavior;
    }

    activateShowSearch() {
        this.search = true;
        return this.searchBehavior.next(this.search);
    }

    deactivateShowSearch() {
        this.search = false;
        return this.searchBehavior.next(this.search);
    }
}
