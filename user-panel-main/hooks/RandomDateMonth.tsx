// Helper function to generate a random integer between two values
export const getRandomInt = (min:any, max:any) => Math.floor(Math.random() * (max - min + 1)) + min;


// Helper function to get random date after 90 days from today
export const getRandomDateAfter90Days = () => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 90); // Add 90 days to today's date

  const currentYear = futureDate.getFullYear(); // Get the year after 90 days
  const randomMonth = futureDate.getMonth(); // Get the month after 90 days

  // Get the number of days in the future month
  const daysInMonth = new Date(currentYear, randomMonth + 1, 0).getDate(); // Last day of the month

  // Generate a random day within the range of days in the month
  const randomDay = getRandomInt(1, daysInMonth); // Random day based on the days in the month
  
  return {
    month: futureDate.toLocaleString("default", { month: "short" }), // Short month name
    day: String(randomDay).padStart(2, '0'), // Two-digit day
    year: currentYear, // Current year after 90 days
  };
};
// Helper function to calculate check-out date based on check-in date
export const calculateCheckOutDate = (checkInDate:any) => {
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + getRandomInt(1, 2)); // Add 1-2 days for check-out
  return checkOutDate;
};