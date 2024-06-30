import {Platform} from 'react-native';
import PushNotification from 'react-native-push-notification';

// Define the channel ID
const CHANNEL_ID = 'alarm_channel';

let alarmTriggered = false;
let setAlarmTriggered;

// Create a notification channel for Android
PushNotification.createChannel(
  {
    channelId: CHANNEL_ID, // (required)
    channelName: 'Alarm Channel', // (required)
    channelDescription: 'A channel for alarm notifications', // (optional) default: undefined.
    playSound: true, // (optional) default: true
    soundName: 'alarm_sound.wav', // (optional) See `soundName` parameter of `localNotification` function
    importance: 4, // (optional) default: 4. Int value of the Android notification importance
    vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
  },
  created => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
);

// Configure push notifications
PushNotification.configure({
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);

    if (notification.action === 'Snooze') {
      handleSnooze();
    } else if (notification.action === 'Dismiss') {
      // Handle dismiss
    }

    if (!alarmTriggered && notification.userInteraction) {
      alarmTriggered = true;
      if (setAlarmTriggered) {
        setAlarmTriggered(true);
      }
    }

    notification.finish('backgroundFetchResultNoData');
  },
  popInitialNotification: true,
  requestPermissions: Platform.OS === 'ios',
});

// Function to set the alarm triggered callback
export const setAlarmTriggerCallback = callback => {
  setAlarmTriggered = callback;
};

// Schedule the alarm
export const scheduleAlarm = alarmTime => {
  console.log('Scheduling alarm for:', alarmTime);
  PushNotification.localNotificationSchedule({
    channelId: CHANNEL_ID, // Pass the channel ID
    message: 'Wake up!',
    date: new Date(alarmTime), // Convert to Date format if not already
    allowWhileIdle: true, // Ensure notification works in doze mode
    repeatType: null, // Do not repeat
    actions: '["Snooze", "Dismiss"]', // Custom actions for the notification
    soundName: 'alarm_sound.wav', // Ensure you have this sound file in the appropriate directory
  });
};

const handleSnooze = () => {
  const snoozeTime = new Date(Date.now() + 1 * 60 * 1000); // 1 minutes later
  console.log('Snoozing alarm to:', snoozeTime);
  scheduleAlarm(snoozeTime); // Reschedule the alarm
};
