import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { dropboxConfig, DbxAuth } from '../configs';
import { LocalStorageMethods, getAuthObj } from '../utils';

import { AuthService } from '../auth.service';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
    public dbxAuth: DbxAuth;
    private subscription: Subscription;

    constructor(private authService: AuthService, private router: Router) {
    }

    ngOnInit() {
        // Get credentials from service and keep data updated
        this.subscription = this.authService.getAuth()
            .subscribe((auth) => this.dbxAuth = auth);

        // Begin authentication process if credentials not found
        if (!this.dbxAuth.isAuth) {
            const authUrl = this.router.url;
            const parameters = authUrl.split('#')[1] || '';
            if (parameters.length > 0) {
                const arrParams = parameters.split('&') || [];
                if (arrParams.length > 0) {
                    const authObj: DbxAuth = { isAuth: false };
                    for (let i = 0; i < arrParams.length; i++) {
                        const arrItem = arrParams[i].split('=');
                        switch (arrItem[0]) {
                            case 'access_token':
                                authObj.accessToken = arrItem[1];
                                break;
                            case 'token_type':
                                authObj.tokenType = arrItem[1];
                                break;
                            case 'uid':
                                authObj.uid = arrItem[1];
                                break;
                            case 'account_id':
                                authObj.accountId = arrItem[1];
                                break;
                            default:
                                break;
                        }
                    }

                    if (authObj.accessToken && authObj.tokenType && authObj.uid && authObj.accountId) {
                        authObj.isAuth = true;
                        this.dbxAuth = authObj;
                    }

                    console.log('authObj', authObj);
                }
            }

            // Store credentials into Auth-service and into localStorage
            if (this.dbxAuth.isAuth) {
                this.authService.storeAuth(this.dbxAuth);
                this.router.navigate(['']); // Navigate the user to homepage
            }
        } else {
            this.router.navigate(['']); // Navigate the user to homepage
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    handleAuthorization() {
        const urlAuth = `https://www.dropbox.com/oauth2/authorize?`
            + `client_id=${dropboxConfig.clientId}`
            + `&redirect_uri=${dropboxConfig.redirectUri}`
            + `&response_type=${dropboxConfig.responseType}`;
        window.location.href = urlAuth;
    }
}
