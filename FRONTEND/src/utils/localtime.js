// This function takes a timezone string as an argument
// and returns the local time for that timezone
export const GetLocalTimeForTimeZone = (timeZone) => {

    // Create a new date object for the current time
    const now = new Date();
  
    // Use Intl.DateTimeFormat to format the time according to the given timezone
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // Use 24-hour time format, set to true for AM/PM format
    });
  
    // Format the current time to the local time of the timezone
    const localTime = timeFormatter.format(now);
  
    return localTime;
  }