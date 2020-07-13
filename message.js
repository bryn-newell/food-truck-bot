/* eslint-disable func-names */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
// disabled because import/export does not work in node
const getTweets = require('./twitter').getTweets;
const getCalEvents = require('./googleCal').getCalEvents;

/**
 * Analyzing the tweet objects by their text and appending the properities isLocatedHere and mentionsToday with boolean values to the tweet objects.
 * @function analyzeTweets
 * @param {array} tweets - an array of tweet objects
 * @return {array} an array of the tweet objects
 */
function analyzeTweets(trucksArr) {
  const conditions = ['flatiron', 'flatiron park', 'flatiron parkway'];
  // Getting today's date
  const today = new Date();
  const weekday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = weekday[today.getDay()];

  const editedTweets = trucksArr.map(truckObj => {
    const { tweets } = truckObj;
    for (const tweetObj of tweets) {
      // Checking if the tweet was sent today and contains the word today
      if (tweetObj.date === today && tweetObj.tweet.includes('today')) {
        tweetObj.mentionsToday = true;
      } else tweetObj.mentionsToday = false;
      // Checking if the tweet mentions today's date
      if (tweetObj.tweet.includes(currentDay)) {
        tweetObj.mentionsToday = true;
      } else tweetObj.mentionsToday = false;
      // if the tweet was sent over a week ago, set mentions today to false
      const oneDay = 1000 * 60 * 60 * 24; // Convert both dates to milliseconds
      const differenceMS = today.getTime() - tweetObj.date.getTime(); // Convert back to days and return
      const daysSincePost = Math.round(differenceMS / oneDay);
      if (daysSincePost > 7) {
        tweetObj.mentionsToday = false;
      }
    }
    // Giving the truck object an isLocatedHere flag and a location based on the tweet that mentioned it was here today
    for (let i = 0; i < tweets.length; i++) {
      if (
        conditions.some(location => tweets[i].tweet.includes(location)) &&
        tweets[i].mentionsToday
      ) {
        truckObj.isLocatedHere = true;
        truckObj.location = 'Flatiron Parkway';
        break;
      } else if (tweets[i].tweet.includes('upslope') && tweets[i].mentionsToday) {
        truckObj.isLocatedHere = true;
        truckObj.location = 'Upslope';
        break;
      } else truckObj.isLocatedHere = false;
    }
    return truckObj;
  });
  return editedTweets;
}

/**
 * Analyzes how many food trucks are in the area today and creates a messaged based on that information.
 * @async
 * @function createMessage
 * @return {Promise<string>} A string describing which food trucks are in the business park today, intended to be sent through a slackbot.
 */
module.exports.createMessage = async function() {
  const defaultSchedule = [
    // monday
    [
      {
        name: 'Smother From Another Mother',
        location: 'Upslope'
      }
    ],
    // tuesday
    [],
    // wednesday
    [
      {
        name: 'La Rue Bayou',
        location: 'Upslope'
      }
    ],
    // thursday
    [
      {
        name: "Rollin' Bones BBQ",
        location: 'Upslope'
      }
    ],
    // friday
    [
      {
        name: "Tibet's",
        location: 'Upslope'
      }
    ]
  ];

  const tweetsArr = await getTweets().catch(err => {
    // eslint-disable-next-line no-console
    console.log(err);
    return err;
  });
  // Run's the check functionality over each tweet to append analytical information
  const testedArr = analyzeTweets(tweetsArr);
  // Create an array of only the truck objects that are here today
  const hereTodayArr = testedArr.filter(truckObj => truckObj.isLocatedHere);

  // Add food trucks from the default schedule into the here today array
  const currentDay = new Date().getDay();
  // there is no suday in the the default array, so we need to find the index of the current day - 1;
  const hereFromSchedule = defaultSchedule[currentDay - 1];
  for (const tweetObj of hereFromSchedule) {
    hereTodayArr.push(tweetObj);
  }
  const googleCal = await getCalEvents();
  if (googleCal) {
    hereTodayArr.push(googleCal);
  }

  // Create a message to send via slack according to the here today array
  let message;

  if (hereTodayArr.length === 0) {
    message =
      "Happy almost lunch time! Unfortunately I don't have any data on what food trucks are outside today, but now you have a great excuse to stretch your legs and find out!";
  } else if (hereTodayArr.length === 1) {
    message = `Happy almost lunch time! The food truck that is here today is ${
      hereTodayArr[0].name
    } at ${hereTodayArr[0].location}!`;
  } else {
    let longerMessage = '';
    let bullet = encodeURI(String.fromCharCode(8226));
    for (let i = 0; i < hereTodayArr.length; i++) {
      if (i !== hereTodayArr.length - 1) {
        longerMessage += `${bullet}${hereTodayArr[i].name} at ${hereTodayArr[i].location}\n`;
      } else {
        longerMessage += `${bullet}${hereTodayArr[i].name} at ${hereTodayArr[i].location}\n`;
      }
    }
    message = `Happy almost lunch time! The food trucks that are here today are: \n${longerMessage}`;
  }
  console.log(message);
  return message;
};
