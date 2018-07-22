import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
// import { FilesService } from './../files.service'; // Deleted by K - Declared but don't use

@Component({
    selector: 'app-breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.css']
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {

    private subscription: Subscription;
    public pathArray;
    // private goBack; // Deleted by K
    public parentFolder;
    // private currentPath; // Deleted by K

    constructor(private activatedRoute: ActivatedRoute,
                private router: Router) {
    }

    ngOnInit() {
        this.subscription = this.activatedRoute.url.subscribe(() => {
            const urlWithoutParams = decodeURIComponent(this.router.url).split('?')[0]; // Added by K
            this.pathArray = this.getPathsToRenderFromUrl(urlWithoutParams); // Edited by K
            // this.goBack = this.goBackFn(); // Deleted by K
            this.goBackFn();
        });
    }

    getPathsToRenderFromUrl(currentPath) {
        let paths = currentPath.split('/');
        if (currentPath === '' || currentPath === '/') {
            paths = [''];
        }
        let fullpath = '';
        const pathsToRender = [];
        for (let i = 0; i < paths.length; i++) {
            const path = decodeURI(paths[i]);
            fullpath += `/${path}`;
            pathsToRender.push({
                path,
                fullpath,
            });
        }
        return pathsToRender;
    }

    goBackFn() {
        return this.parentFolder = this.pathArray.slice(0, -1);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
