/**
 * Time utility functions for Amsterdam timezone using date-fns-tz
 */
import { toZonedTime } from 'date-fns-tz';

/**
 * Returns the current Amsterdam time as a Date object
 * @returns Date object representing current time in Amsterdam timezone
 */
export function getCurrentAmsterdamTimeISO(): Date {
  return toZonedTime(new Date(), 'Europe/Amsterdam');
}