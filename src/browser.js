// ==UserScript==
// @name         GT Course Browser
// @namespace    https://github.com/jerryc05/GT-Course-Browser
// @supportURL   https://github.com/jerryc05/GT-Course-Browser
// @version      0.1
// @description  GaTech Course Browser parsed from registration.banner.gatech.edu
// @author       jerryc05
// @match        https://registration.banner.gatech.edu/StudentRegistrationSsb/ssb/classSearch/classSearch
// @match        https://registration.banner.gatech.edu/StudentRegistrationSsb/ssb/classRegistration/classRegistration
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gatech.edu
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    const SQUARE_BRACKETED_NAME = '[GT Course Browser]'
    const DEFAULT_PAGE_MAX_SIZE = 50

    let syncToken = document.querySelector('meta[name="synchronizerToken"]').getAttribute('content')
    console.log(`${SQUARE_BRACKETED_NAME} synchronizerToken: ${syncToken}`)

    function f(offset = 0, maxSize = DEFAULT_PAGE_MAX_SIZE) {
        return fetch(`https://registration.banner.gatech.edu/StudentRegistrationSsb/ssb/searchResults/searchResults` +
            `?txt_subject=CS` +
            `&txt_campus=A` +
            `&txt_term=202208` + // TODO: get thie from web page element

            `&startDatepicker=&endDatepicker=` +
            `&uniqueSessionId=?????${Date.now()}` + // Parsed from https://registration.banner.gatech.edu/StudentRegistrationSsb/assets/modules/searchResultsView-mf.unminified.js

            `&pageOffset=${offset}` +
            `&pageMaxSize=${maxSize}` +
            `&sortColumn=subjectDescription&sortDirection=asc`, {
                headers: new Headers({
                    'X-Synchronizer-Token': syncToken
                })
            }
        ).then(x => x.json())
    }


    f().then(js => {
        console.log(`${SQUARE_BRACKETED_NAME} js:${JSON.stringify(js)}`)
        if (js.data === null) {
            console.error(`${SQUARE_BRACKETED_NAME} [searchResults] returned null [data]! Something is not working!`)
            return
        }
        f(DEFAULT_PAGE_MAX_SIZE, js.totalCount - DEFAULT_PAGE_MAX_SIZE).then(
            js2 => {
                console.log(`${SQUARE_BRACKETED_NAME} js2:${JSON.stringify(js2)}`)
                const data = js.data.concat(js2.data)
                console.log(`${SQUARE_BRACKETED_NAME} data:`)
                console.log(data)
            })
    })

})();
