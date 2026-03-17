import Swal from 'sweetalert2';

// 0.2s = 200ms
const ANIMATION_DURATION = 200;
const AUTO_CLOSE_DURATION = 3000;

// Color Palette
const COLORS = {
  success: '#3ddc84', // Parrot Green (success, added, accepted, delivered)
  error: '#ff3b30',   // Apple Red (failed, rejected, deleted, cancelled)
  info: '#007aff',    // Blue (out for delivery, neutral)
};

const getThemeColor = (type) => {
  if (type === 'success') return COLORS.success;
  if (type === 'error') return COLORS.error;
  if (type === 'info') return COLORS.info;
  return '#333'; // Default fallback
};

/**
 * Display a fast auto-closing SweetAlert with custom colors
 * @param {string} title 
 * @param {string} text 
 * @param {'success' | 'error' | 'info'} type 
 */
export const showAlert = (title, text, type = 'info') => {
  const themeColor = getThemeColor(type);

  return Swal.fire({
    title,
    text,
    icon: type,
    iconColor: themeColor,
    timer: AUTO_CLOSE_DURATION,
    timerProgressBar: true,
    showConfirmButton: false, // Auto-close alerts usually don't need a button
    background: '#1a1a1a', // Dark theme matching the app
    color: '#fff',
    backdrop: `rgba(0,0,0,0.4)`,
    showClass: {
      popup: `animate__animated animate__fadeIn`,
    },
    hideClass: {
      popup: `animate__animated animate__fadeOut`,
    },
    customClass: {
      timerProgressBar: `sweet-progress-${type}` // we will handle this color below via a style injection
    },
    didOpen: () => {
      // Force 0.2s animation duration
      const popup = Swal.getPopup();
      if (popup) popup.style.setProperty('--animate-duration', '0.2s');
      // Inject CSS for the progress bar color specifically for this instance
      const progress = Swal.getTimerProgressBar();
      if (progress) {
        progress.style.backgroundColor = themeColor;
      }
    }
  });
};

/**
 * Display a fast animating SweetAlert Confirm dialog with custom colors
 * @param {string} title 
 * @param {string} text 
 * @param {'success' | 'error' | 'info'} type Default 'error' since confirms are usually destructive
 * @returns {Promise<boolean>} Resolves to true if user clicks confirm, false otherwise or on 3s timeout
 */
export const showConfirm = async (title, text, type = 'error') => {
  const themeColor = getThemeColor(type);

  const result = await Swal.fire({
    title,
    text,
    icon: type,
    iconColor: themeColor,
    showCancelButton: true,
    confirmButtonColor: themeColor,
    cancelButtonColor: '#444',
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    timer: AUTO_CLOSE_DURATION, // Auto close in 3 seconds
    timerProgressBar: true,
    background: '#1a1a1a',
    color: '#fff',
    backdrop: `rgba(0,0,0,0.4)`,
    showClass: {
      popup: `animate__animated animate__fadeIn`,
    },
    hideClass: {
      popup: `animate__animated animate__fadeOut`,
    },
    didOpen: () => {
      const popup = Swal.getPopup();
      if (popup) popup.style.setProperty('--animate-duration', '0.2s');
      const progress = Swal.getTimerProgressBar();
      if (progress) {
        progress.style.backgroundColor = themeColor;
      }
    }
  });

  return result.isConfirmed;
};
