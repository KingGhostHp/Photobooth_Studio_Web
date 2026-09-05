/**
 * Vietnam Timezone Utility (GMT+7: Asia/Ho_Chi_Minh)
 */

// Returns date string in Vietnam timezone formatted as YYYY-MM-DD
export const getVietnamDateString = (date = new Date()) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(date);
  } catch (err) {
    // Fallback if Intl fails
    const vnOffset = 7 * 60; // GMT+7 in minutes
    const localTime = date.getTime();
    const localOffset = date.getTimezoneOffset() * 60000;
    const utc = localTime + localOffset;
    const vnDate = new Date(utc + (vnOffset * 60000));
    const year = vnDate.getFullYear();
    const month = String(vnDate.getMonth() + 1).padStart(2, '0');
    const day = String(vnDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

// Returns current Vietnam hours and minutes
export const getVietnamTime = (date = new Date()) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(date);
    const hours = parseInt(parts.find(p => p.type === 'hour')?.value || 0, 10);
    const minutes = parseInt(parts.find(p => p.type === 'minute')?.value || 0, 10);
    return { hours, minutes };
  } catch (err) {
    const now = new Date();
    return { hours: now.getHours(), minutes: now.getMinutes() };
  }
};

// Checks whether a time slot on a given date has already passed in Vietnam time
export const isSlotInPastVietnam = (dateStr, timeSlotStr) => {
  const todayVN = getVietnamDateString();
  if (!dateStr || dateStr < todayVN) {
    return true; // Any date before today in Vietnam is in the past
  }
  if (dateStr === todayVN && timeSlotStr) {
    // Extract start time "08:30" from "08:30 - 10:00"
    const startTimePart = timeSlotStr.split('-')[0].trim();
    if (startTimePart) {
      const [slotH, slotM] = startTimePart.split(':').map(Number);
      const { hours: vnH, minutes: vnM } = getVietnamTime();
      if (vnH > slotH || (vnH === slotH && vnM >= slotM)) {
        return true; // Slot time has already passed today in Vietnam
      }
    }
  }
  return false;
};
