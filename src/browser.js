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


// eslint-disable-next-line require-await
(async() => {
  'use strict'

  const SQUARE_BRACKETED_NAME = '[GT Course Browser]',
    PAGE_SIZE = 50,
    UNIQ_SESS_ID = `12345${Date.now()}`,
    DOM_ID = 'gt_course_browser',
    MAX_SUBJECTS = 90
  let subject = ''
  let term = ''

  /** @type {{code:string, description:string}[]} */
  let subjects = []



  /**
   * @param {string} s
   */
  function unescapeHTML(s) {
    return new DOMParser().parseFromString(s, 'text/html').documentElement.innerText
  }

  /**
   * @param {HTMLDivElement} div
   * @param {string} subject
   * @param {string} term
   * @param {string} campus
   * @param {'open'|'close'|'all'} filterOpen
   */
  async function doSearch(div, campus = 'A', filterOpen = 'open') {
    const syncToken = String(document.querySelector('meta[name="synchronizerToken"]').getAttribute('content'))
    console.log(`${SQUARE_BRACKETED_NAME} synchronizerToken: ${syncToken}`)


    async function f(offset = 0) {
      const x = await fetch('https://registration.banner.gatech.edu/' +
              'StudentRegistrationSsb/ssb/searchResults/searchResults' +
              `?txt_subject=${subject}` +
              `&txt_campus=${campus}` +
              `&txt_term=${term}` +
              '&startDatepicker=&endDatepicker=' +
              `&uniqueSessionId=${UNIQ_SESS_ID}` + // Parsed from https://registration.banner.gatech.edu/StudentRegistrationSsb/assets/modules/searchResultsView-mf.unminified.js
              `&pageOffset=${offset}` +
              `&pageMaxSize=${PAGE_SIZE}` +
              '&sortColumn=subjectDescription&sortDirection=asc', {
        headers: new Headers({
          'X-Synchronizer-Token': syncToken
        })
      })
      return x.json()
    }



    // Must do this POST request to authorize your cookies
    await fetch('https://registration.banner.gatech.edu/StudentRegistrationSsb/ssb/term/search?mode=search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded' // Must include this header
      },
      body: `term=${term}&studyPath=&studyPathText=&` +
              `startDatepicker=&endDatepicker=&uniqueSessionId=${UNIQ_SESS_ID}`
    })



    let data = []

    const js = await f()
    // console.log(`${SQUARE_BRACKETED_NAME} js:${JSON.stringify(js)}`)
    if (js.data === null) {
      console.error(`${SQUARE_BRACKETED_NAME} [searchResults] returned null [data]! Something is not working!`)
      return
    }
    data = data.concat(js.data)
    console.log(`${SQUARE_BRACKETED_NAME} got ${js.data.length}, total ${data.length} courses`)




    const reqs = []
    for (let i = PAGE_SIZE; i < js.totalCount; i += PAGE_SIZE) reqs.push(f(i))


    const jss = await Promise.all(reqs)
    for (const js2 of jss) {
      // console.log(`${SQUARE_BRACKETED_NAME} js2:${JSON.stringify(js2)}`)
      data = data.concat(js2.data)
      console.log(`${SQUARE_BRACKETED_NAME} got ${js2.data.length}, total ${data.length} courses`)
    }

    console.log(`${SQUARE_BRACKETED_NAME} courses:`)
    console.dir(data)



    const frag = document.createDocumentFragment()
    for (const c of data) {
      if ((filterOpen === 'open' && !c.openSection) || (filterOpen === 'close' && c.openSection)) continue
      const pre = document.createElement('pre')
      pre.style.display = 'block'
      pre.style.margin = '0'
      pre.style.border = '0'
      pre.style.padding = '0'
      pre.innerText = `${c.courseReferenceNumber} |` +
              ` ${c.subjectCourse.padEnd(7)} - ${c.sequenceNumber.padEnd(3)} |` +
              ` ${c.openSection ? 'OPEN ' : 'CLOSE'} |` +
              ` ${c.creditHours === null ? `${c.creditHourLow}+` : String(c.creditHours).padStart(2)} cr |` +
              ` ${unescapeHTML(c.courseTitle).padEnd(25)} |` +
              ` Seat: ${String(c.enrollment).padEnd(3)}/${String(c.maximumEnrollment).padEnd(3)} |` +
              ` WL: ${String(c.waitCount).padEnd(3)}/${String(c.waitCapacity).padEnd(3)}`
      frag.append(pre)
    }
    div.append(frag)
  }



  const div = document.createElement('div')
  div.id = DOM_ID
  // @ts-ignore
  document.getElementById('content').append(div)


  const nullOption = document.createElement('option')
  nullOption.innerText = '=== Select below ==='
  nullOption.selected = true


  const btn = document.createElement('button')
  btn.disabled = true


  const subjectSelect = document.createElement('select')
  const termSelect = document.createElement('select')


  subjectSelect.append(nullOption.cloneNode(true))
  subjectSelect.onchange = x => {
    subject = x.target.value
    const isTermSelected = termSelect.value !== ''

    btn.disabled = subject === '' || !isTermSelected
  }


  const fall2022Option = document.createElement('option')
  fall2022Option.value = '202208'
  fall2022Option.innerText = '202208'
  termSelect.append(nullOption.cloneNode(true), fall2022Option)
  termSelect.onchange = async x => {
    term = x.target.value
    const isSubjectSelected = subjectSelect.value !== ''

    btn.disabled = term === '' || !isSubjectSelected


    if (term !== '') {
      btn.disabled = isSubjectSelected

      subjects = await (await fetch('https://registration.banner.gatech.edu/' +
              'StudentRegistrationSsb/ssb/classSearch/get_subject' +
              '?searchTerm=' +
              `&term=${term}` +
              `&offset=1&max=${MAX_SUBJECTS}` +
              `&uniqueSessionId=${UNIQ_SESS_ID}`)).json()

      subjectSelect.innerHTML = ''
      subjectSelect.append(nullOption.cloneNode(true))
      for (const s of subjects) {
        const opt = document.createElement('option')
        opt.value = s.code
        opt.innerText = unescapeHTML(s.description)
        subjectSelect.append(opt)
      }
    }
  }



  const atlOption = document.createElement('option')
  atlOption.value = 'A'
  atlOption.innerText = 'Atlanta'
  const campusSelect = document.createElement('select')
  campusSelect.append(atlOption)


  const openOnlyOption = document.createElement('option')
  openOnlyOption.value = 'open'
  openOnlyOption.innerText = 'Open Only'
  const closeOnlyOption = document.createElement('option')
  closeOnlyOption.value = 'close'
  closeOnlyOption.innerText = 'Close Only'
  const allSectionsOption = document.createElement('option')
  allSectionsOption.value = 'all'
  allSectionsOption.innerText = 'All sections'
  const filterOpenSelect = document.createElement('select')
  filterOpenSelect.append(openOnlyOption, closeOnlyOption, allSectionsOption)


  btn.innerText = 'Search'
  btn.onclick = () => {
    doSearch(div, campusSelect.value, filterOpenSelect.value)
    btn.disabled = true
  }


  const searchBar = document.createElement('div')
  searchBar.style.margin = '5rem auto'
  searchBar.style.width = 'fit-content'
  searchBar.append(termSelect, subjectSelect, campusSelect, filterOpenSelect, btn)

  div.append(searchBar)


  const css = document.createElement('style')
  css.textContent = `
  #${DOM_ID}>div:first-child{height:2rem}
  #${DOM_ID}>div:first-child *{height:inherit}
  #${DOM_ID} button:not([disabled]){background-color:#4CAF50;}
  `
  document.head.append(css)
})()
