/**
 * Auth & Session — Cookie-based user session management
 */

import Cookies from "js-cookie";

export const updateUserCookie = function (user) {
    const userDataString = JSON.stringify({
        name: user.name,
        email: user.email,
        id: user.id
    });

    Cookies.set('user_data', userDataString, {
        expires: 1,
        secure: true,
        sameSite: 'Strict'
    });
}

export const checkSession = async function () {
    const useDataCookie = Cookies.get('user_data');

    if (useDataCookie) {
        return JSON.parse(useDataCookie);
    }
};

export const getUserSessionData = function (user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email
    }
}
