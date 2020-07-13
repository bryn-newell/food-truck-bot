const {
  google
} = require('googleapis');
const config = require('./config.js').google;

const {
  API_KEY
} = config;
const {
  CAL_ID
} = config;

// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
// eslint-disable-next-line func-names
module.exports.getCalEvents = async function () {
  const calendar = google.calendar({
    version: 'v3',
    auth: API_KEY
  });
  const today = new Date();
  today.setDate(today.getDate());

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return new Promise((resolve, reject) => {
    calendar.events.list({
        calendarId: CAL_ID,
        timeMin: today,
        timeMax: tomorrow,
        maxResults: 1,
        singleEvents: true,
        orderBy: 'startTime'
      },
      (err, res) => {
        if (err) reject(err);
        const events = res.data.items;
        if (events.length) {
          const todaysEvents = events.map(event => {
            return {
              summary: event.summary
            };
          });
          const hereToday = todaysEvents.filter(event =>
            event.summary.includes('@ Flatiron Parkway')
          );
          if (hereToday.length > 0) {
            resolve({
              name: "Seb's Pizza",
              location: 'Flatiron Parkway'
            });
          } else {
            console.log('Not here today');
            resolve(null);
          }
        } else {
          console.log('No upcoming events found.');
          resolve(null);
        }
      }
    );
  });
};