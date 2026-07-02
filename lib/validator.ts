export const validateRequired = (value: string | undefined | null): boolean => {
  if (value === undefined || value === null) return false;
  return value.trim().length > 0;
};

export const validateSriLankanPhone = (phone: string): boolean => {
  // Remove any spaces or dashes from the input before validating
  const cleanedPhone = phone.replace(/[\s-]/g, "");
  
  // Regex to match Sri Lankan mobile numbers (WhatsApp numbers)
  // Matches: 07xxxxxxxx, 947xxxxxxxx, +947xxxxxxxx
  const sriLankanMobileRegex = /^(?:0|94|\+94)7\d{8}$/;
  
  return sriLankanMobileRegex.test(cleanedPhone);
};

export const checkRateLimit = (): { allowed: boolean; message?: string } => {
  const SUBMISSION_COOLDOWN_MS = 60 * 1000; // 1 minute cooldown between submissions
  
  try {
    const lastSubmissionTime = localStorage.getItem("last-submission-timestamp");
    const currentTime = Date.now();

    if (lastSubmissionTime) {
      const timeSinceLastSubmission = currentTime - parseInt(lastSubmissionTime, 10);
      
      if (timeSinceLastSubmission < SUBMISSION_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((SUBMISSION_COOLDOWN_MS - timeSinceLastSubmission) / 1000);
        return { 
          allowed: false, 
          message: `Please wait ${remainingSeconds} seconds before submitting again.` 
        };
      }
    }

    return { allowed: true };
  } catch {
    // If localStorage is blocked or fails, allow submission to avoid breaking the form
    return { allowed: true };
  }
};

export const recordSubmissionTimestamp = (): void => {
  try {
    localStorage.setItem("last-submission-timestamp", Date.now().toString());
  } catch {
    // Ignore error
  }
};
