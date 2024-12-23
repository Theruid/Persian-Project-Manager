export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('رمز عبور باید حداقل ۶ کاراکتر باشد');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('رمز عبور باید حداقل یک حرف بزرگ داشته باشد');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('رمز عبور باید حداقل یک عدد داشته باشد');
  }
  
  return errors;
};