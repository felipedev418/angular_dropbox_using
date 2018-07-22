# Dropbox Explorer - DropEx
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) v6.0.8. You may want to know about how you can [start here](ANGULAR.md), view [online demo here](https://ecdropex.firebaseapp.com/) and our [sketchboard](https://sketchboard.me/lA0SWJEBeaSJ#/).

You may want to view about these things in this project:
* [Angular version 6](https://blog.angular.io/version-6-of-angular-now-available-cc56b0efa7a4)  and [RxJS](https://github.com/ReactiveX/rxjs)
* [Dropbox API version 2](https://www.dropbox.com/developers) and [Dropbox webhooks](https://www.dropbox.com/developers/reference/webhooks)
* [AngularFire2](https://github.com/angular/angularfire2)
* [Firebase Realtime Database](https://firebase.google.com/docs/database/)
* [Firebase Hosting](https://firebase.google.com/docs/hosting/)
* [Cloud Functions for Firebase](https://firebase.google.com/docs/functions/)
* [Google Cloud Platform](https://cloud.google.com/)

## Screenshot
![Screenshot](assets/screenshot.png)

## Using
|Folder|Description|
|---|---|
|dropex|Main codes|
|webhooks| Using for creating cloud function|
|deploy| Using for deploying your app
* Run `npm install` in these folders `dropex` and `webhooks/functions`
* You need to change many configs in the file `/dropex/src/app/configs.ts` for this app. It include these things
   * Dropbox config
   * Firebase config
* Run `npm start` in `/dropex` to start your local web server at `http://localhost:4200`
* I will close all my servers or change my configs at any time. This project is only using to learn by youself.

## References
### Guides
* [Express server](https://expressjs.com/en/4x/api.html)
* [List of HTTP status codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes)
* [Dropbox files/list_folder behaviour](https://www.dropboxforum.com/t5/API-Support-Feedback/Dropbox-files-list-folder-behaviour/td-p/232948)
* [Firebase CLI Reference](https://firebase.google.com/docs/cli/)
* [Firebase - Call Functions via HTTP Requests](https://firebase.google.com/docs/functions/http-events#using_express_request_and_response_objects)
* [Introduction To Firebase Cloud Functions](https://medium.com/codingthesmartway-com-blog/introduction-to-firebase-cloud-functions-c220613f0ef)
* [Content Security Policy (CSP)](https://content-security-policy.com/)