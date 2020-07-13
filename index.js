const fetch = require('node-fetch');
const token = require('./config').slackbot.token;
const channel = 'food-truck-updates';
let createMessage = require('./message').createMessage;
let message =
  "Unfortunately I'm having trouble getting any data on what food trucks are here today, but now you have a great excuse to stretch your legs and find out!";

/**
 * Calling the message that was created for the slackbot and sending it in a fetch request to the slack bot url and sending a response to the now zeit host
 * @async
 * @function
 * @param {req, res}
 * @return {}
 */
module.exports = async (req, res) => {
  try {
    message = await createMessage();
    await fetch(
      `https://slack.com/api/chat.postMessage?token=${token}&channel=${channel}&text=${message}&pretty=1`
    );
    res.end('Hello! Your message has been sent to the food truck slackbot.');
  } catch (err) {
    console.log(err);
    res.statusCode = 500;
    res.end('Sorry there was a problem.');
  }
};