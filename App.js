import React, {useState, useEffect} from 'react';
import {View, Button, StyleSheet, Platform, Text, Alert} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  scheduleAlarm,
  setAlarmTriggerCallback,
  setSnoozeEndTimeCallback,
  resetAlarm,
} from './src/PushNotificationConfig';
import BackgroundFetch from 'react-native-background-fetch';
import {toZonedTime, formatInTimeZone} from 'date-fns-tz';
import notifee from '@notifee/react-native';

const App = () => {
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [displayAlarmTime, setDisplayAlarmTime] = useState('');
  const [alarmTriggered, setAlarmTriggered] = useState(false);
  const [snoozeEndTime, setSnoozeEndTime] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setAlarmTriggerCallback(() => {
      setAlarmTriggered(true);
      setStatusMessage('Alarm Triggered!');
    });
    setSnoozeEndTimeCallback(time => {
      setSnoozeEndTime(time);
      setStatusMessage(
        `Snoozed! Alarm will trigger again at ${time.toLocaleTimeString()}`,
      );
    });

    // Initialize BackgroundFetch only if it's available
    if (BackgroundFetch) {
      BackgroundFetch.configure(
        {
          minimumFetchInterval: 15, // fetch interval in minutes
          stopOnTerminate: false, // keep running after app is terminated
          startOnBoot: true, // start on device boot
        },
        async taskId => {
          console.log('[BackgroundFetch] taskId: ', taskId);
          // Perform your background tasks here
          BackgroundFetch.finish(taskId);
        },
        error => {
          console.error('[BackgroundFetch] failed to start: ', error);
        },
      );

      // Start BackgroundFetch
      BackgroundFetch.start();

      return () => {
        BackgroundFetch.stop();
      };
    } else {
      console.error('BackgroundFetch is not available');
    }
  }, []);

  const scheduleAlarmHandler = selectedTime => {
    try {
      const timeZone = 'Asia/Colombo';
      const zonedDate = toZonedTime(selectedTime, timeZone);
      const formattedDate = formatInTimeZone(zonedDate, timeZone, 'HH:mm');
      setDisplayAlarmTime(formattedDate);
      scheduleAlarm(zonedDate.getTime()); // Use getTime() to schedule the alarm at the correct time
      console.log('Alarm scheduled for:', formattedDate);
      setStatusMessage(`Alarm set for ${formattedDate}`);
    } catch (error) {
      console.error('Error scheduling alarm:', error);
      Alert.alert('Error', 'Failed to schedule alarm.');
    }
  };

  const resetAlarmHandler = () => {
    try {
      resetAlarm();
      setDisplayAlarmTime('');
      setAlarmTriggered(false);
      setSnoozeEndTime(null);
      setStatusMessage('Alarm reset.');
      console.log('Alarm reset.');
    } catch (error) {
      console.error('Error resetting alarm:', error);
      Alert.alert('Error', 'Failed to reset alarm.');
    }
  };

  const testAlarmSound = async () => {
    try {
      await notifee.displayNotification({
        title: 'Test Alarm',
        body: 'This is a test alarm notification',
        android: {
          channelId: 'alarm_channel',
          sound: 'alarm_sound',
        },
        ios: {
          sound: 'alarm_sound.caf',
        },
      });
      console.log('Test alarm sound played');
      setStatusMessage('Test alarm sound played.');
    } catch (error) {
      console.error('Error testing alarm sound:', error);
      Alert.alert('Error', 'Failed to play test alarm sound.');
    }
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || alarmTime;
    setShowPicker(false);
    setAlarmTime(currentDate);

    if (selectedDate) {
      const now = new Date();
      const selectedDateTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        selectedDate.getHours(),
        selectedDate.getMinutes(),
        0,
        0,
      );

      if (selectedDateTime < now) {
        selectedDateTime.setDate(selectedDateTime.getDate() + 1);
      }

      scheduleAlarmHandler(selectedDateTime);
    }
  };

  useEffect(() => {
    const errorListener = error => {
      console.error('Caught global error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    };

    // Add global error listeners
    ErrorUtils.setGlobalHandler(errorListener);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alarm App</Text>
      <Button title="Set Alarm Time" onPress={() => setShowPicker(true)} />
      {showPicker && (
        <DateTimePicker
          value={alarmTime}
          mode="time"
          display="default"
          onChange={onChange}
          style={styles.dateTimePicker}
        />
      )}
      <Text style={styles.alarmText}>Alarm Set For: {displayAlarmTime}</Text>
      {snoozeEndTime && (
        <Text style={styles.snoozeText}>
          Snooze Active Until: {snoozeEndTime.toLocaleTimeString()}
        </Text>
      )}
      <View style={styles.buttonContainer}>
        <Button title="Test Alarm Sound" onPress={testAlarmSound} />
        <Button title="Reset Alarm" onPress={resetAlarmHandler} />
      </View>
      {alarmTriggered && (
        <Text style={styles.triggeredText}>Alarm Triggered!</Text>
      )}
      <Text style={styles.statusMessage}>{statusMessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dateTimePicker: {
    width: 300,
    height: 200,
    marginVertical: 10,
  },
  alarmText: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
  },
  snoozeText: {
    fontSize: 18,
    marginVertical: 10,
    textAlign: 'center',
    color: 'blue',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    width: '100%',
  },
  triggeredText: {
    fontSize: 18,
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 16,
    color: 'green',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default App;
