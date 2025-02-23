//====================================================
// ============== GET DATE TIME  =====================
//====================================================
// JavaScript timestamp
var timestamp = new Date();
// console.log('timestamp: ', timestamp);

// Create a new JavaScript Date object
var date = new Date(timestamp);
// console.log('date: ', date);

// Format the date in "Y-m-d H:i" format
var currentDateTime = date.getFullYear() + '-' +
    ('0' + (date.getMonth() + 1)).slice(-2) + '-' +  // Add leading zero to month and format
    ('0' + date.getDate()).slice(-2) + ' ' +         // Add leading zero to day and format
    ('0' + date.getHours()).slice(-2) + ':' +        // Add leading zero to hours and format
    ('0' + date.getMinutes()).slice(-2);             // Add leading zero to minutes and format
// Output the formatted date
// console.log('currentDateTime: ', currentDateTime);

// Get the current year
var currentYear = date.getFullYear();
// console.log('currentYear: ', currentYear);

// Get the current month and add leading zero
var currentMonth = ('0' + (date.getMonth() + 1)).slice(-2);
// console.log('currentMonth: ', currentMonth);

// Get the current day and add leading zero
var currentDay = ('0' + date.getDate()).slice(-2);
// console.log('currentDay: ', currentDay);

// Get the current minute and add leading zero
var currentMinute = ('0' + date.getMinutes()).slice(-2);
// console.log('currentMinute: ', currentMinute);

// Get the current hour and add leading zero
var currentHour = ('0' + date.getHours()).slice(-2);
// console.log('currentHour: ', currentHour);


//====================================================
// ============== GET NWS DATA  ======================
//====================================================
// Day 1
var day1 = new Date(timestamp);
day1.setDate(date.getDate() + 1);
var nws_day1_date = ('0' + (day1.getMonth() + 1)).slice(-2) + '-' + ('0' + day1.getDate()).slice(-2) + '-' + day1.getFullYear();
var nws_day1_date_title = ('0' + (day1.getMonth() + 1)).slice(-2) + '-' + ('0' + day1.getDate()).slice(-2);

// Day 2
var day2 = new Date(date);
day2.setDate(date.getDate() + 2);
var nws_day2_date = ('0' + (day2.getMonth() + 1)).slice(-2) + '-' + ('0' + day2.getDate()).slice(-2) + '-' + day2.getFullYear();
var nws_day2_date_title = ('0' + (day2.getMonth() + 1)).slice(-2) + '-' + ('0' + day2.getDate()).slice(-2);

// Day 3
var day3 = new Date(date);
day3.setDate(date.getDate() + 3);
var nws_day3_date = ('0' + (day3.getMonth() + 1)).slice(-2) + '-' + ('0' + day3.getDate()).slice(-2) + '-' + day3.getFullYear();
var nws_day3_date_title = ('0' + (day3.getMonth() + 1)).slice(-2) + '-' + ('0' + day3.getDate()).slice(-2);

// console.log("nws day1, day2, and day3 = ", nws_day1_date, nws_day2_date, nws_day3_date);

// Define an array of day abbreviations
var dayAbbreviations = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Get the day of the week (0-6, where 0 is Sunday and 6 is Saturday)
var dayIndex = date.getDay();
// Ensure the day index doesn't go beyond the range
var dayIndexPlusOne = (dayIndex + 1) % 7;
var dayIndexPlusTwo = (dayIndex + 2) % 7;
var dayIndexPlusThree = (dayIndex + 3) % 7;
// Get the three-letter abbreviation for the current day
var currentDayAbbreviation = dayAbbreviations[dayIndex];
var currentPlusOneDayAbbreviation = dayAbbreviations[dayIndexPlusOne];
var currentPlusTwoDayAbbreviation = dayAbbreviations[dayIndexPlusTwo];
var currentPlusThreeDayAbbreviation = dayAbbreviations[dayIndexPlusThree];
// Output the result
// console.log('currentDayAbbreviation: ', currentDayAbbreviation);
// console.log('currentPlusOneDayAbbreviation: ', currentPlusOneDayAbbreviation);
// console.log('currentPlusTwoDayAbbreviation: ', currentPlusTwoDayAbbreviation);
// console.log('currentPlusThreeDayAbbreviation: ', currentPlusThreeDayAbbreviation);