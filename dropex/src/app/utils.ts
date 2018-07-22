import { dropboxConfig, DbxAuth } from './configs';

export function getParamFromUrl(param) {
    try {
        const sQueryString = document.URL.split('#')[1] || document.URL.split('?')[1] || '';
        const searchParams = new URLSearchParams(sQueryString);
        if (searchParams.has(param)) {
            return searchParams.get(param);
        } else {
            return '';
        }
    } catch (error) {
        return error;
    }
}

export const UrlMethods = {
    decodeWithoutParams(url) {
        try {
            let cleanUrl = decodeURIComponent(url).split('?')[0] || '';
            if (cleanUrl === '/') {
                cleanUrl = '';
            }
            return cleanUrl;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
};

export function getAuthObj() {
    try {
        const sQueryString = document.URL.split('#')[1] || document.URL.split('?')[1] || '';
        const referrerUrl = document.referrer;

        // This object's properties must be like the return URL from Dropbox API
        const objParams = { access_token: '',
                            token_type: '',
                            uid: '',
                            account_id: ''
                        };

        if (sQueryString && referrerUrl.startsWith(dropboxConfig.trustUrl)) {
            const arrParams = sQueryString.split('&');
            for (let i = 0; i < arrParams.length; i++) {
                const item = arrParams[i].split('=');
                for (const key of Object.keys(objParams)) {
                    if (key === item[0]) {
                        objParams[key] = item[1];
                    }
                }
            }
        }

        return objParams;
    } catch (error) {
        return error;
    }
}

export const LocalStorageMethods = {
    store(key, value) {
        try {
            if (typeof(Storage) !== 'undefined') {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return error;
        }
    },
    retrieve(key) {
        try {
            if (typeof(Storage) !== 'undefined') {
                if (localStorage.getItem(key)) {
                    return JSON.parse(localStorage.getItem(key));
                } else {
                    return null;
                }
            } else {
                return false;
            }
        } catch (error) {
            return error;
        }
    },
    remove(key) {
        try {
            if (typeof(Storage) !== 'undefined') {
                if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                    return true;
                } else {
                    return null;
                }
            } else {
                return false;
            }
        } catch (error) {
            return error;
        }
    },
    clear() {
        try {
            if (typeof(Storage) !== 'undefined') {
                localStorage.clear();
            } else {
                return false;
            }
        } catch (error) {
            return error;
        }
    }
};
