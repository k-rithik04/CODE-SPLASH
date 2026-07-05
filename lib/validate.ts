export const validateRequired = (value: string | undefined | null): boolean => {
  if (value === undefined || value === null) return false;
  return value.trim().length > 0;
};

export const validateEmail = (email: string): boolean => {
  if (!validateRequired(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const validateName = (name: string): boolean => {
  if (!validateRequired(name)) return false;
  return /^[a-zA-Z\s.\-']+$/.test(name.trim());
};

export const validateSriLankanPhone = (phone: string): boolean => {
  const cleanedPhone = phone.replace(/[\s-]/g, "");
  const sriLankanPhoneRegex = /^(?:(?:0|94|\+94)(?:7\d{8}|[1-9]\d{8}))$/;
  return sriLankanPhoneRegex.test(cleanedPhone);
};

export const validateLength = (value: string, min: number, max: number): boolean => {
  if (!validateRequired(value)) return false;
  const len = value.trim().length;
  return len >= min && len <= max;
};

export const checkRateLimit = (): { allowed: boolean; message?: string } => {
  const SUBMISSION_COOLDOWN_MS = 60 * 1000;
  try {
    const lastSubmissionTime = localStorage.getItem("last-submission-timestamp");
    const currentTime = Date.now();
    if (lastSubmissionTime) {
      const timeSinceLastSubmission = currentTime - parseInt(lastSubmissionTime, 10);
      if (timeSinceLastSubmission < SUBMISSION_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((SUBMISSION_COOLDOWN_MS - timeSinceLastSubmission) / 1000);
        return { allowed: false, message: `Please wait ${remainingSeconds} seconds before submitting again.` };
      }
    }
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
};

export const recordSubmissionTimestamp = (): void => {
  try {
    localStorage.setItem("last-submission-timestamp", Date.now().toString());
  } catch {
    // Ignore
  }
};
