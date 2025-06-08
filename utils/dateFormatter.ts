// utils/dateFormatter.ts

/**
 * Formats a date string or Date object into "Weekday, DD de Month de YYYY" in Portuguese.
 * Example: "Domingo, 01 de junho de 2025"
 * @param dateInput The date to format (string or Date object).
 * @returns The formatted date string, or an empty string if input is invalid.
 */
export const formatFullDate = (dateInput?: string | Date): string => {
  if (!dateInput) return '';
  try {
    let date = new Date(dateInput);
    if (typeof dateInput === 'string' && !dateInput.includes('Z') && dateInput.includes('T')) {
        // Assuming local or needs to be.
    }

    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error("Error formatting date:", dateInput, error);
    return 'Data inválida';
  }
};

/**
 * Calculates the number of full months passed since a given date string.
 * @param dateString The start date string.
 * @returns Number of full months.
 */
export const getMonthsSince = (dateString: string): number => {
  if (!dateString) return 0;
  try {
    const startDate = new Date(dateString);
    const currentDate = new Date();

    if (isNaN(startDate.getTime())) return 0;

    let months = (currentDate.getFullYear() - startDate.getFullYear()) * 12;
    months -= startDate.getMonth();
    months += currentDate.getMonth();
    
    if (currentDate.getDate() < startDate.getDate()) {
      months--;
    }
    return months <= 0 ? 0 : months;
  } catch {
    return 0;
  }
};

/**
 * Calculates the number of full days passed since a given date string.
 * @param dateString The start date string.
 * @returns Number of full days.
 */
export const getDaysSince = (dateString: string): number => {
  if (!dateString) return 0;
  try {
    const startDate = new Date(dateString);
    const currentDate = new Date();

    if (isNaN(startDate.getTime())) return 0;

    const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch {
    return 0;
  }
};


const calculateDeadlineDate = (submissionCreatedAt: string): Date => {
  const submissionDate = new Date(submissionCreatedAt);
  let deadline = new Date(submissionDate);
  let businessDaysToAdd = 7; 

  while (businessDaysToAdd > 0) {
    deadline.setDate(deadline.getDate() + 1);
    const dayOfWeek = deadline.getDay(); 
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { 
      businessDaysToAdd--;
    }
  }
  deadline.setHours(18, 0, 0, 0);
  return deadline;
};

export const calculateDeadlineTimestamp = (submissionCreatedAt: string): number => {
  if (!submissionCreatedAt) return 0;
  try {
    const deadlineDate = calculateDeadlineDate(submissionCreatedAt);
    return deadlineDate.getTime();
  } catch (error) {
    console.error("Error calculating deadline timestamp:", error);
    return 0;
  }
};

export const calculateFeedbackDeadlineInfo = (submissionCreatedAt: string, deadlineTimestampParam?: number): { deadlineText: string; countdownString: string; isPastDeadline: boolean } => {
  if (!submissionCreatedAt) return { deadlineText: 'N/A', countdownString: 'N/A', isPastDeadline: false };

  try {
    const deadline = deadlineTimestampParam ? new Date(deadlineTimestampParam) : calculateDeadlineDate(submissionCreatedAt);
    
    const deadlineText = `${formatFullDate(deadline)} às ${deadline.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const isPastDeadline = diff < 0;

    if (isPastDeadline) {
      return { deadlineText, countdownString: 'Prazo Expirado', isPastDeadline: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);

    const countdownString = `${days}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
    
    return { deadlineText, countdownString, isPastDeadline };
  } catch (error) {
    console.error("Error calculating deadline:", error);
    return { deadlineText: 'Erro', countdownString: 'Erro', isPastDeadline: false };
  }
};

export const calculateAge = (dateOfBirthString?: string): number => {
  if (!dateOfBirthString) return 0;
  try {
    const birthDate = new Date(dateOfBirthString);
    if (isNaN(birthDate.getTime())) return 0;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : 0;
  } catch {
    return 0;
  }
};

/**
 * Calculates the number of days remaining until a given end date.
 * @param endDateString The end date as an ISO string.
 * @returns A string indicating days remaining or "Expirado" or "N/A".
 */
export const calculateDaysRemaining = (endDateString?: string): string => {
  if (!endDateString) return 'N/A';
  try {
    const endDate = new Date(endDateString);
    if (isNaN(endDate.getTime())) return 'Data Inválida';

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endDateEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);

    if (endDateEnd < todayStart) {
      return 'Expirado';
    }

    const diffTime = endDateEnd.getTime() - todayStart.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} dia(s)`;
  } catch (error) {
    console.error("Error calculating days remaining:", error);
    return 'Erro';
  }
};

/**
 * Formats month and year into "Month/YYYY" in Portuguese.
 * Example: "Julho/2024"
 * @param monthNum The month number (1-12).
 * @param year The year.
 * @returns The formatted string, or an empty string if input is invalid.
 */
export const formatMonthYear = (monthNum?: number, year?: number): string => {
  if (!monthNum || !year || monthNum < 1 || monthNum > 12) return '';
  const date = new Date(year, monthNum - 1); 
  const monthName = date.toLocaleString('pt-BR', { month: 'long' });
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)}/${year}`;
};

/**
 * Formats an ISO date string to be compatible with datetime-local input fields.
 * Example: "2024-07-15T10:30"
 * @param isoString The ISO date string.
 * @returns The formatted string for datetime-local input, or an empty string if input is invalid.
 */
export const formatDateTimeForInput = (isoString?: string): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        // Adjust for timezone offset to display local time correctly in the input
        const timezoneOffset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
        const localISOTime = new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
        return localISOTime;
    } catch (error) {
        console.error("Error formatting datetime for input:", isoString, error);
        return '';
    }
};

/**
 * Returns the name of the month and year for a given date.
 * Example: "Julho de 2024"
 * @param date The date object.
 * @returns Formatted string.
 */
export const getMonthNameYear = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

/**
 * Returns the number of days in a given month and year.
 * @param year The full year.
 * @param month The month (0-indexed, i.e., 0 for January).
 * @returns Number of days in the month.
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Returns the day of the week for the first day of a given month and year.
 * @param year The full year.
 * @param month The month (0-indexed).
 * @returns Day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday).
 */
export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};
