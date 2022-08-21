(async () => {
    'use strict';

    const SQUARE_BRACKETED_NAME = '[GT Course Browser]'
    const DEFAULT_PAGE_MAX_SIZE = 50
    const UNIQ_SESS_ID = `12345${Date.now()}`
    let term = '202208'

    let syncToken = document.querySelector('meta[name="synchronizerToken"]').getAttribute('content')
    console.log(`${SQUARE_BRACKETED_NAME} synchronizerToken: ${syncToken}`)

    async function f(offset = 0, maxSize = DEFAULT_PAGE_MAX_SIZE) {
        let x = await fetch(`https://registration.banner.gatech.edu/StudentRegistrationSsb/ssb/searchResults/searchResults` +
            `?txt_subject=CS` +
            `&txt_campus=A` +
            `&txt_term=${term}` +
            `&startDatepicker=&endDatepicker=` +
            `&uniqueSessionId=${UNIQ_SESS_ID}` + // Parsed from https://registration.banner.gatech.edu/StudentRegistrationSsb/assets/modules/searchResultsView-mf.unminified.js
            `&pageOffset=${offset}` +
            `&pageMaxSize=${maxSize}` +
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
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' // Must include this header
        },
        body: `term=${term}&studyPath=&studyPathText=&startDatepicker=&endDatepicker=&uniqueSessionId=${UNIQ_SESS_ID}`
    })

    let js = await f()
    console.log(`${SQUARE_BRACKETED_NAME} js:${JSON.stringify(js)}`)
    if (js.data === null) {
        console.error(`${SQUARE_BRACKETED_NAME} [searchResults] returned null [data]! Something is not working!`)
        return
    }

    let js2 = await f(DEFAULT_PAGE_MAX_SIZE, js.totalCount - DEFAULT_PAGE_MAX_SIZE)
    console.log(`${SQUARE_BRACKETED_NAME} js2:${JSON.stringify(js2)}`)

    const data = js.data.concat(js2.data)
    console.log(`${SQUARE_BRACKETED_NAME} data:`)
    console.log(data)

})();
