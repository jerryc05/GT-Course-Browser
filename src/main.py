#!/usr/bin/env python3

import asyncio
import json
import os
import time
from typing import Any, Sequence
from html import unescape
from aiohttp import ClientSession


class MeetingTime:
    def __init__(self, x: Any):
        self.beginTime: str = x['beginTime']
        self.endTime: str = x['endTime']

        self.buildingDescription: str = x['buildingDescription']
        self.room: str = x['room']

        self.monday: bool = x['monday']
        self.tuesday: bool = x['tuesday']
        self.wednesday: bool = x['wednesday']
        self.thursday: bool = x['thursday']
        self.friday: bool = x['friday']
        self.saturday: bool = x['saturday']
        self.sunday: bool = x['sunday']


class Faculty:
    def __init__(self, x: Any):
        self.name: str = x['displayName']
        self.email: str = x['emailAddress']


class Course:
    def __init__(self, x: Any):
        self.subject: str = x['subjectCourse']
        self.crn: str = x['courseReferenceNumber']
        self.title: str = unescape(x['courseTitle'])

        self.section_num: str = x['sequenceNumber']  # Section #
        self.is_section_open: bool = x['openSection']  # If section is open

        self.credit_hours: int = x['creditHours']

        self.seats_available: int = x['seatsAvailable']  # # of seats available
        self.seats_taken: int = x['enrollment']  # # of seats taken
        self.seats_total: int = x[
            'maximumEnrollment'
        ]  # # of seats total = (available + taken)

        self.wait_available: int = x['waitAvailable']  # # of seats available, might be < 0
        self.wait_taken: int = x['waitCount']  # # of seats taken
        self.wait_total: int = x['waitCapacity']  # # of seats total

        self.faculty: Sequence[Faculty] = tuple(Faculty(x) for x in x['faculty'])
        self.meeting_time: Sequence[MeetingTime] = tuple(
            MeetingTime(x['meetingTime']) for x in x['meetingsFaculty']
        )


class SearchResults:
    def __init__(self, x: Any) -> None:
        assert x['data'] is not None
        self.courses: Sequence[Course] = tuple(Course(x) for x in x['data'])
        self.totalCourses: int = x['totalCount']


def parse(js_txt: str) -> int:
    result = SearchResults(json.loads(js_txt))

    if result.courses is None:  # No courses found
        print('No courses found')
        # return

    for course in result.courses:
        if course.is_section_open and (course.seats_available or course.wait_available):
            print(
                f'{course.crn} | {course.subject:7} - {course.section_num:3} |'
                f' {"OPEN " if course.is_section_open else "CLOSE"} |'
                f' {str(course.credit_hours) if course.credit_hours is not None else "?"} cr |'
                f' {course.title:25} | Seat:'
                f' {course.seats_available:3}/{course.seats_total:3} | Waitlist:'
                f' {course.wait_available:3}/{course.wait_total:3}'
            )

    return result.totalCourses


async def send_req(sess: ClientSession, page_offset: int = 0, page_size: int = 50):
    async with sess.get(
        "https://registration.banner.gatech.edu/StudentRegistrationSsb/"
        "ssb/searchResults/searchResults",
        params={
            'txt_subject': 'CS',  # Computer Science
            'txt_campus': 'A',  # Atlanta
            'txt_term': '202208',  # Fall 2022
            'startDatepicker': '',
            'endDatepicker': '',
            # Parsed from https://registration.banner.gatech.edu/StudentRegistrationSsb/assets/modules/searchResultsView-mf.unminified.js
            'uniqueSessionId': f'abc45{int(time.time()*1000)}',
            'pageOffset': page_offset,
            'pageMaxSize': page_size,  # Max number of courses each page
            'sortColumn': 'subjectDescription',
            'sortDirection': 'asc',
        },
    ) as r:
        assert r.status < 400
        total_pages = parse(await r.text())

        if page_offset == 0:
            await send_req(sess, page_offset=page_size, page_size=total_pages - page_offset)


async def main():
    headers_dict = {
        'Cookie': os.getenv('GTCOOKIE', ''),
        # TODO: get this from <meta name="synchronizerToken" content="?????"> in HTML
        'X-Synchronizer-Token': os.getenv('GTTOKEN', ''),
        'Host': 'registration.banner.gatech.edu',
        'Referer': (
            'https://registration.banner.gatech.edu/StudentRegistrationSsb/'
            'ssb/classSearch/classSearch'
        ),
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.2) like Gecko',
        "X-Requested-With": "XMLHttpRequest",
    }

    assert headers_dict['Cookie'].startswith('JSESSIONID')
    assert len(headers_dict['X-Synchronizer-Token']) == 36

    async with ClientSession(headers=headers_dict) as sess:
        await send_req(sess)


if __name__ == '__main__':
    asyncio.run(main())
