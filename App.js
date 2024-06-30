import React, {useState, useEffect} from 'react';
import {View, Button, StyleSheet, Platform, Text} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  scheduleAlarm,
  setAlarmTriggerCallback,
} from './src/PushNotificationConfig';
import BackgroundTimer from 'react-native-background-timer';
import {toZonedTime, formatInTimeZone} from 'date-fns-tz';
import PushNotification from 'react-native-push-notification';

const App = () => {
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [displayAlarmTime, setDisplayAlarmTime] = useState('');
  const [alarmTriggered, setAlarmTriggered] = useState(false);

  useEffect(() => {
    setAlarmTriggerCallback(setAlarmTriggered);
  }, []);

  const scheduleAlarmHandler = () => {
    const timeZone = 'Asia/Colombo';
    const zonedDate = toZonedTime(alarmTime, timeZone);
    const formattedDate = formatInTimeZone(zonedDate, timeZone, 'HH:mm');
    setDisplayAlarmTime(formattedDate);
    scheduleAlarm(zonedDate);
    console.log('Alarm scheduled for:', formattedDate);
  };

  const testAlarmSound = () => {
    PushNotification.localNotification({
      channelId: 'alarm_channel', // Pass the channel ID
      message: 'Test Alarm',
      soundName: 'alarm_sound.wav',
    });
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || alarmTime;
    setShowPicker(Platform.OS === 'ios');
    setAlarmTime(currentDate);
  };

  BackgroundTimer.runBackgroundTimer(() => {
    console.log('Background timer running');
  }, 60000);

  return (
    <View style={styles.container}>
      <Button title="Set Alarm Time" onPress={() => setShowPicker(true)} />
      {showPicker && (
        <DateTimePicker
          value={alarmTime}
          mode="time"
          display="default"
          onChange={onChange}
        />
      )}
      <Text style={styles.alarmText}>Alarm Set For: {displayAlarmTime}</Text>
      <Button title="Set Alarm" onPress={scheduleAlarmHandler} />
      <Button title="Test Alarm Sound" onPress={testAlarmSound} />
      {alarmTriggered && (
        <Text style={styles.triggeredText}>Alarm Triggered!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alarmText: {
    fontSize: 18,
    margin: 10,
  },
  triggeredText: {
    fontSize: 18,
    color: 'red',
    margin: 10,
  },
});

export default App;
