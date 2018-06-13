/**
 * Convert seconds to days, hours, minutes, and seconds
 */

module.exports.formatSeconds = (seconds, recent) => {
  let days = Math.floor(seconds / (60 * 60 * 24)); // days
  seconds -= days * 60 * 60 * 24;
  const hrs = Math.floor(seconds / (60 * 60)); // hours
  seconds -= hrs * 60 * 60;
  const mnts = Math.floor(seconds / 60); // minutes
  seconds -= mnts * 60; // seconds

  let res = '';
  if (days < 0)
    days = 0;


  if (recent || days > 0) // Always shows days for current season, else if > 0
    res += (' ' + days + 'd');
  // Only shows hours and minutes if not for current season
  if (!recent && (hrs > 0 || days > 0)) // Shows hours if exists or days exists
    res += (' ' + hrs + 'h');
  if (!recent && (mnts > 0 || hrs > 0)) // Shows min if exists or hours exists
    res += (' ' + mnts + 'm');
  return res;
};