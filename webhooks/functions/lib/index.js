"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const firebaseAdmin = require("firebase-admin");
// Initalizing Firebase and Firestore
firebaseAdmin.initializeApp(functions.config().firebase);
exports.defaultHeaders = {
    'Content-Type': 'text/html',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST',
    'Access-Control-Allow-Headers': 'Content-Type'
};
exports.dbxwebhooks = functions.https.onRequest((request, response) => {
    switch (request.method) {
        case 'GET':
            const queryString = request.query.challenge;
            const responseHeaders = {
                'Content-Type': 'text/plain',
                'X-Content-Type-Options': 'nosniff'
            };
            response.status(200)
                .set(responseHeaders)
                .send(queryString);
            break;
        case 'POST':
            const newKey = firebaseAdmin.database().ref('dbxwebhooks').push().key;
            firebaseAdmin.database()
                .ref('dbxwebhooks/' + newKey)
                .set(Object.assign({}, request.body, { timestamp: Date.now() }), (error) => {
                if (error) {
                    response.status(400)
                        .set(exports.defaultHeaders)
                        .send(error);
                }
                else {
                    response.status(200)
                        .set(exports.defaultHeaders)
                        .send('Process successfully');
                }
            });
            break;
        default:
            response.status(400)
                .set(exports.defaultHeaders)
                .send('Bad Request');
            break;
    }
});
//# sourceMappingURL=index.js.map