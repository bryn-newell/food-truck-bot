const Twitter = require('twitter');
const config = require('./config.js').twitter;

const client = new Twitter(config);

/**
 * Fetching a handful of the most recent tweets from all of the food truck accounts we use and parsing them into smaller tweet objects only containing the text, the date it was sent, any urls it contains, and the name of the food truck.
 * @async
 * @function getTweets
 * @return {array} an array of arrays of tweet objects
 */
// eslint-disable-next-line func-names
module.exports.getTweets = async function() {
  const queryParams = { count: 5, exclude_replies: true, tweet_mode: 'extended' };
  const foodTrucks = [
    {
      name: 'Arepa',
      screen_name: 'TheArepaJoint'
    },
    {
      name: 'Eggcellent',
      screen_name: 'EggcellentTruck'
    },
    {
      name: "Sancho's",
      screen_name: 'SanchosMexican'
    },
    {
      name: 'Colorado Fried Chicken',
      screen_name: 'COFriedChx'
    },
    {
      name: 'Monzu',
      screen_name: 'MonzuLongmont'
    },
    {
      name: 'Sweet Cow',
      screen_name: 'FindMyMooMobile'
    },
    {
      name: 'La Rue Bayou',
      screen_name: 'RueBayou'
    },
    {
      name: "Seb's Wood Fired Pizza",
      screen_name: 'SebsLLC'
    },
    {
      name: "Tibet's",
      screen_name: 'TibetRestaurant'
    },
    {
      name: "Rollin' Bones BBQ",
      screen_name: 'RollinBonesBBQ'
    }
  ];

  const promises = foodTrucks.map(async objs => {
    const res = await client.get('statuses/user_timeline.json', {
      screen_name: objs.screen_name,
      ...queryParams
    });
    const tweetsArr = res.map(tweet => {
      return {
        date: new Date(tweet.created_at),
        tweet: tweet.full_text.toLowerCase(),
        url: tweet.entities.urls[0] ? tweet.entities.urls[0].url : null
      };
    });
    return {
      name: objs.name,
      tweets: tweetsArr
    };
  });
  return Promise.all(promises);
};
