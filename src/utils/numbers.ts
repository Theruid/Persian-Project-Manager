export const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export const toPersianNumbers = (num: number | string) => {
  if (num === null || num === undefined) return '';
  return num.toString().replace(/[0-9]/g, w => persianDigits[+w]);
};

export const toEnglishNumbers = (str: string) => {
  return str.replace(/[۰-۹]/g, w => persianDigits.indexOf(w).toString());
};

export const convertTextWithNumbers = (text: string, toPersian: boolean = true) => {
  if (toPersian) {
    return text.replace(/[0-9]/g, w => persianDigits[+w]);
  } else {
    return text.replace(/[۰-۹]/g, w => persianDigits.indexOf(w).toString());
  }
};

export const parsePersianDateTime = (persianDate: string) => {
  try {
    // Convert Persian numbers to English
    const englishDate = toEnglishNumbers(persianDate);
    
    // Split date and time
    const [date, time] = englishDate.split(' - ');
    if (!date || !time) throw new Error('Invalid date format');

    // Parse date components
    const [year, month, day] = date.split('/').map(num => parseInt(num, 10));
    if (!year || !month || !day) throw new Error('Invalid date components');

    // Parse time components
    const [hour, minute] = time.split(':').map(num => parseInt(num, 10));
    if (hour === undefined || minute === undefined) throw new Error('Invalid time components');

    // Create Date object (note: month is 0-based in JavaScript)
    const dateObj = new Date(year, month - 1, day, hour, minute);
    if (isNaN(dateObj.getTime())) throw new Error('Invalid date object');

    return dateObj.toISOString();
  } catch (error) {
    console.error('Error parsing date:', error);
    throw error;
  }
};
