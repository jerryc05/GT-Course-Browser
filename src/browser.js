// ==UserScript==
// @name         GT Course Browser
// @namespace    https://github.com/jerryc05/GT-Course-Browser
// @supportURL   https://github.com/jerryc05/GT-Course-Browser
// @version      0.1
// @description  GaTech Course Browser parsed from registration.banner.gatech.edu
// @author       jerryc05
// @match        https://registration.banner.gatech.edu/BannerExtensibility/customPage/page/HOMEPAGE_Registration
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gatech.edu
// @grant        none
// ==/UserScript==

(async () => {
    // @match        https://registration.banner.gatech.edu/StudentRegistrationSsb/ssb/*
    'use strict';

    const SQUARE_BRACKETED_NAME = '[GT Course Browser]'
    const PAGE_SIZE = 50
    const UNIQ_SESS_ID = `12345${Date.now()}`
    let term = '202208'

    let syncToken = document.querySelector('meta[name="synchronizerToken"]').getAttribute('content')
    console.log(`${SQUARE_BRACKETED_NAME} synchronizerToken: ${syncToken}`)

    async function f(offset = 0) {
        let x = await fetch(`https://registration.banner.gatech.edu/StudentRegistrationSsb/ssb/searchResults/searchResults` +
            `?txt_subject=CS` +
            `&txt_campus=A` +
            `&txt_term=${term}` +
            `&startDatepicker=&endDatepicker=` +
            `&uniqueSessionId=${UNIQ_SESS_ID}` + // Parsed from https://registration.banner.gatech.edu/StudentRegistrationSsb/assets/modules/searchResultsView-mf.unminified.js
            `&pageOffset=${offset}` +
            `&pageMaxSize=${PAGE_SIZE}` +
            `&sortColumn=subjectDescription&sortDirection=asc`, {
                headers: new Headers({
                    'X-Synchronizer-Token': syncToken
                })
            })
        return x.json()
    }




    // Must do this POST request to authorize your cookies
    let x = await fetch('https://registration.banner.gatech.edu/StudentRegistrationSsb/ssb/term/search?mode=search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // Must include this header
        },
        body: `term=${term}&studyPath=&studyPathText=&startDatepicker=&endDatepicker=&uniqueSessionId=${UNIQ_SESS_ID}`
    })




    let data = []

    let js = await f()
    //console.log(`${SQUARE_BRACKETED_NAME} js:${JSON.stringify(js)}`)
    if (js.data === null) {
        console.error(`${SQUARE_BRACKETED_NAME} [searchResults] returned null [data]! Something is not working!`)
        return
    }
    data = data.concat(js.data)
    console.log(`${SQUARE_BRACKETED_NAME} got ${js.data.length}, total ${data.length} courses`)




    let reqs = []
    for (let i = PAGE_SIZE; i < js.totalCount; i += PAGE_SIZE) {
        reqs.push(f(i))
    }

    let jss = await Promise.all(reqs)
    for (let js2 of jss) {
        //console.log(`${SQUARE_BRACKETED_NAME} js2:${JSON.stringify(js2)}`)
        data = data.concat(js2.data)
        console.log(`${SQUARE_BRACKETED_NAME} got ${js2.data.length}, total ${data.length} courses`)
    }

    console.log(`${SQUARE_BRACKETED_NAME} courses:`)
    console.dir(data)

    const frag = document.createDocumentFragment()
    for (let c of data) {
        const pre = document.createElement('pre')
        pre.style.display = 'block'
        pre.innerText = `${c.courseReferenceNumber} | ${c.subjectCourse.padEnd(7)} - ${c.sequenceNumber.padEnd(3)} |` +
            ` ${c.openSection ? "OPEN " : "CLOSE"} |` +
            ` ${c.creditHours !== null ? c.creditHours : "?"} cr |` +
            ` ${c.courseTitle.padEnd(25)} | Seat:` +
            ` ${String(c.seatsAvailable).padEnd(3)}/${String(c.enrollment).padEnd(3)} | Waitlist:` +
            ` ${String(c.waitAvailable).padEnd(3)}/${String(c.waitCapacity).padEnd(3)}`
        frag.append(pre)
    }
    const div = document.createElement('div')
    div.append(frag)
    document.getElementById('content').append(div)
    //console.log(div.innerHTML)

})();
