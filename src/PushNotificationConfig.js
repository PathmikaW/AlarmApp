import {Platform} from 'react-native';
import notifee, {
  AndroidImportance,
  EventType,
  TriggerType,
} from '@notifee/react-native';

// Define the channel ID
const CHANNEL_ID = 'alarm_channel';

let alarmTriggered = false;
let setAlarmTriggered;
let setSnoozeEndTime;

// Create a notification channel for Android
async function createNotificationChannel() {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Alarm Channel',
    description: 'A channel for alarm notifications',
    sound: 'alarm_sound', // Ensure you have this sound file in the raw directory for Android
    importance: AndroidImportance.HIGH,
    vibration: true,
  });
  console.log('Notification channel created');
}

createNotificationChannel();

// Configure foreground push notifications
notifee.onForegroundEvent(async ({type, detail}) => {
  console.log('onForegroundEvent:', type, detail);
  if (type === EventType.ACTION_PRESS) {
    const {pressAction} = detail;

    if (pressAction.id === 'snooze') {
      console.log('Snooze button pressed');
      handleSnooze();
    } else if (pressAction.id === 'dismiss') {
      console.log('Dismiss button pressed');
      handleDismiss();
    }

    if (
      !alarmTriggered &&
      detail.notification &&
      detail.notification.pressAction
    ) {
      console.log('Alarm triggered');
      alarmTriggered = true;
      if (setAlarmTriggered) {
        setAlarmTriggered(true);
      }
    }
  }
});

// Configure background push notifications
notifee.onBackgroundEvent(async ({type, detail}) => {
  console.log('onBackgroundEvent:', type, detail);
  if (type === EventType.ACTION_PRESS) {
    const {pressAction} = detail;

    if (pressAction.id === 'snooze') {
      console.log('Snooze button pressed');
      handleSnooze();
    } else if (pressAction.id === 'dismiss') {
      console.log('Dismiss button pressed');
      handleDismiss();
    }

    if (
      !alarmTriggered &&
      detail.notification &&
      detail.notification.pressAction
    ) {
      console.log('Alarm triggered');
      alarmTriggered = true;
      if (setAlarmTriggered) {
        setAlarmTriggered(true);
      }
    }
  }
});

// Function to set the alarm triggered callback
export const setAlarmTriggerCallback = callback => {
  setAlarmTriggered = callback;
};

// Function to set the snooze end time callback
export const setSnoozeEndTimeCallback = callback => {
  setSnoozeEndTime = callback;
};

// Schedule the alarm
export const scheduleAlarm = async alarmTime => {
  console.log('Scheduling alarm for:', new Date(alarmTime).toString());
  await notifee.createTriggerNotification(
    {
      title: 'Wake up!',
      body: "It's time to get up!",
      android: {
        channelId: CHANNEL_ID,
        pressAction: {
          id: 'default',
        },
        actions: [
          {
            title: 'Snooze',
            pressAction: {id: 'snooze'},
          },
          {
            title: 'Dismiss',
            pressAction: {id: 'dismiss'},
          },
        ],
        sound: 'alarm_sound',
      },
      ios: {
        sound: 'alarm_sound.caf', // Ensure you have this sound file in the appropriate directory
      },
    },
    {
      type: TriggerType.TIMESTAMP,
      timestamp: alarmTime, // Use the timestamp here
    },
  );
  console.log('Alarm scheduled');
};

export const resetAlarm = () => {
  // Logic to reset the alarm (e.g., cancel any scheduled notifications)
  notifee.cancelAllNotifications();
  alarmTriggered = false;
  console.log('Alarm reset');
};

const handleSnooze = async () => {
  const snoozeTime = new Date(Date.now() + 1 * 60 * 1000); // 1 minute later
  console.log('Snoozing alarm to:', snoozeTime.toString());
  setSnoozeEndTime && setSnoozeEndTime(snoozeTime);
  await scheduleAlarm(snoozeTime.getTime()); // Reschedule the alarm
  console.log('Alarm snoozed to:', snoozeTime.toString());
};

const handleDismiss = () => {
  console.log('Alarm dismissed');
  resetAlarm();
};
