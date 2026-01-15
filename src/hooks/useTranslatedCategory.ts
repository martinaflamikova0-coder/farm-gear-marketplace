import { useTranslation } from 'react-i18next';

/**
 * Hook to get translated category name from slug
 * Falls back to the original name if translation is not available
 */
export const useTranslatedCategory = () => {
  const { t, i18n } = useTranslation();

  const translateCategory = (slugOrName: string | null | undefined): string => {
    if (!slugOrName) return '';
    
    // Try to translate using the slug as key
    const translationKey = `categoryNames.${slugOrName}`;
    const translated = t(translationKey, { defaultValue: '' });
    
    // If translation exists and is different from the key, return it
    if (translated && translated !== translationKey && translated !== '') {
      return translated;
    }
    
    // Fallback: return the original value with first letter capitalized
    return slugOrName.charAt(0).toUpperCase() + slugOrName.slice(1).replace(/-/g, ' ');
  };

  return { translateCategory };
};

/**
 * Non-hook version for use in components that can't use hooks
 */
export const getTranslatedCategory = (
  slugOrName: string | null | undefined,
  t: (key: string, options?: object) => string
): string => {
  if (!slugOrName) return '';
  
  const translationKey = `categoryNames.${slugOrName}`;
  const translated = t(translationKey, { defaultValue: '' });
  
  if (translated && translated !== translationKey && translated !== '') {
    return translated;
  }
  
  return slugOrName.charAt(0).toUpperCase() + slugOrName.slice(1).replace(/-/g, ' ');
};
