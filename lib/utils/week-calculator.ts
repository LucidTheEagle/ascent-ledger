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

// ============================================
// RECOVERY MODE ADDITIONS
// ============================================

/**
 * Get the Monday of the current week (week start) in Date format
 * Used for recovery check-ins to ensure one check-in per week
 * Alias for getCurrentWeekStartDate() for consistency with recovery API
 */
export function getWeekOf(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0); // Reset time to start of day
  return monday;
}

/**
 * Calculate which week number the user is on (1-indexed)
 * Week 1 starts from the date they created their vision or crisis protocol
 * 
 * @param userId - User ID to check
 * @returns Week number (1-indexed)
 */
export async function getUserWeekNumber(userId: string): Promise<number> {
  const { prisma } = await import("@/lib/prisma");
  
  // Check if user is in recovery mode
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { operatingMode: true, recoveryStartDate: true, createdAt: true },
  });

  if (!user) return 1;

  let startDate: Date;
  
  if (user.operatingMode === "RECOVERY" && user.recoveryStartDate) {
    startDate = user.recoveryStartDate;
  } else {
    // For Vision Track, use account creation date or first vision canvas date
    const firstVision = await prisma.visionCanvas.findFirst({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    
    startDate = firstVision?.createdAt || user.createdAt;
  }

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weekNumber = Math.ceil(diffDays / 7);

  return weekNumber;
}

/**
 * Check if user has already logged/checked-in this week
 * Mode-aware: checks recovery_checkins for RECOVERY mode, strategic_logs for ASCENT mode
 * 
 * @param userId - User ID to check
 * @returns true if already logged this week, false otherwise
 */
export async function hasLoggedThisWeek(userId: string): Promise<boolean> {
  const { prisma } = await import("@/lib/prisma");
  const weekStart = getWeekOf();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { operatingMode: true },
  });

  if (user?.operatingMode === "RECOVERY") {
    // Check recovery check-ins
    const checkin = await prisma.recoveryCheckin.findFirst({
      where: {
        userId,
        weekOf: weekStart,
      },
    });
    return !!checkin;
  } else {
    // Check strategic logs
    const log = await prisma.strategicLog.findFirst({
      where: {
        userId,
        weekOf: weekStart,
      },
    });
    return !!log;
  }
}

/**
 * Format date to readable week string (e.g., "Week of Jan 15, 2024")
 * 
 * @param date - Date to format
 * @returns Formatted string
 */
export function formatWeekOf(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}