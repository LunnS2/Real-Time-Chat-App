import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes safely
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Format date with proper typing and const declarations
export function formatDate(dateMs: number): string {
  // Convert milliseconds to seconds
  const dateSeconds = dateMs / 1000;

  // Convert to Date object
  const dateObj = new Date(dateSeconds * 1000);

  // Get current date and time
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const currentTime = currentDate.getTime();

  // Get the date part of the provided date
  const providedDate = new Date(dateObj);
  providedDate.setHours(0, 0, 0, 0);

  // Check if it's today
  if (providedDate.getTime() === currentTime) {
    return dateObj.toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit", 
      hour12: true 
    });
  }

  // Check if it's yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  if (providedDate.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  // Check if it's a different day of the week
  if (providedDate.getDay() < currentDate.getDay()) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[providedDate.getDay()];
  }

  // Default date format
  return `${providedDate.getMonth() + 1}/${providedDate.getDate()}/${providedDate.getFullYear()}`;
}

// Check if two timestamps are on the same day
export const isSameDay = (timestamp1: number, timestamp2: number): boolean => {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Define message type for better type safety
type Message = {
  _creationTime: number;
};

// Get relative date time with proper typing
export const getRelativeDateTime = (
  message: Message,
  previousMessage: Message | null
): string | undefined => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const messageDate = new Date(message._creationTime);

  if (!previousMessage || !isSameDay(previousMessage._creationTime, messageDate.getTime())) {
    if (isSameDay(messageDate.getTime(), today.getTime())) {
      return "Today";
    } else if (isSameDay(messageDate.getTime(), yesterday.getTime())) {
      return "Yesterday";
    } else if (messageDate.getTime() > lastWeek.getTime()) {
      return messageDate.toLocaleDateString(undefined, { weekday: "long" });
    }
    return messageDate.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
};

// Generate random ID with proper typing
export function randomID(len: number = 5): string {
  const chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP";
  let result = "";
  
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}