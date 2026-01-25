// ============================================
// lib/utils/week-calculator.ts
// THE MIND: Temporal Awareness
// Calculates which "Ascent Week" the user is in
// ============================================

/**
 * Calculate which Ascent Week the user is currently in
 * Week 1 = First 7 days after account creation
 * Week 2 = Days 8-14, etc.
 * 
 * @param userCreatedAt - User's account creation date
 * @returns Current week number (1-indexed)
 */
export function getAscentWeek(userCreatedAt: Date): number {
    const now = new Date();
    const createdDate = new Date(userCreatedAt);
    
    // Calculate difference in milliseconds
    const diffInMs = now.getTime() - createdDate.getTime();
    
    // Convert to days
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    // Calculate week number (add 1 because Week 1 starts at day 0)
    const weekNumber = Math.floor(diffInDays / 7) + 1;
    
    return Math.max(1, weekNumber); // Never return less than Week 1
  }
  
  /**
   * Get the start date (Monday) of the current week
   * Used for checking if a log already exists for this week
   * 
   * @returns Date object set to Monday 00:00:00 of current week
   */
  export function getCurrentWeekStartDate(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate days to subtract to get to Monday
    // If Sunday (0), go back 6 days. Otherwise, go back (dayOfWeek - 1) days
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // Create new date set to Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysToMonday);
    monday.setHours(0, 0, 0, 0); // Set to midnight
    
    return monday;
  }
  
  /**
   * Get the end date (Sunday) of the current week
   * 
   * @returns Date object set to Sunday 23:59:59 of current week
   */
  export function getCurrentWeekEndDate(): Date {
    const monday = getCurrentWeekStartDate();
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return sunday;
  }
  
  /**
   * Check if a given date falls within the current week
   * 
   * @param date - Date to check
   * @returns true if date is in current week, false otherwise
   */
  export function isCurrentWeek(date: Date): boolean {
    const start = getCurrentWeekStartDate();
    const end = getCurrentWeekEndDate();
    const checkDate = new Date(date);
    
    return checkDate >= start && checkDate <= end;
  }
  
  /**
   * Format week range for display
   * E.g., "Week of Dec 16 - Dec 22, 2024"
   * 
   * @returns Formatted string
   */
  export function formatCurrentWeekRange(): string {
    const start = getCurrentWeekStartDate();
    const end = getCurrentWeekEndDate();
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    };
    
    const startStr = start.toLocaleDateString('en-US', options);
    const endStr = end.toLocaleDateString('en-US', { 
      ...options, 
      year: 'numeric' 
    });
    
    return `Week of ${startStr} - ${endStr}`;
  }