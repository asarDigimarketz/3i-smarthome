const fetch = require('node-fetch');

async function sendExpoNotification(token) {
  const message = {
    to: token,
    sound: 'default',
    title: 'Hello from Node.js!',
    body: 'This is a test notification.',
    data: { customKey: 'value' },
  };

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  const data = await response.json();
  console.log(data);
}

// Replace with your actual Expo push token:
const expoPushToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';

sendExpoNotification(expoPushToken); 