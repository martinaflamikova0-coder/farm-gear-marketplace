import { useTranslation } from 'react-i18next';
import type { ProductWithSeller } from './useProducts';

type TranslationsObject = Record<string, string>;

/**
 * Hook to get translated title and description for a product
 * Falls back to original fields if translation is not available
 */
export const useTranslatedProduct = (product: ProductWithSeller | null) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  if (!product) {
    return { title: '', description: '' };
  }

  // Get translated title
  const titleTranslations = product.title_translations as TranslationsObject | null;
  const translatedTitle = titleTranslations?.[currentLang] || product.title;

  // Get translated description
  const descriptionTranslations = product.description_translations as TranslationsObject | null;
  const translatedDescription = descriptionTranslations?.[currentLang] || product.description || '';

  return {
    title: translatedTitle,
    description: translatedDescription,
  };
};

/**
 * Get translated title for a product (non-hook version for lists)
 */
export const getTranslatedTitle = (
  product: ProductWithSeller,
  lang: string
): string => {
  const titleTranslations = product.title_translations as TranslationsObject | null;
  return titleTranslations?.[lang] || product.title;
};

/**
 * Get translated description for a product (non-hook version for lists)
 */
export const getTranslatedDescription = (
  product: ProductWithSeller,
  lang: string
): string => {
  const descriptionTranslations = product.description_translations as TranslationsObject | null;
  return descriptionTranslations?.[lang] || product.description || '';
};
