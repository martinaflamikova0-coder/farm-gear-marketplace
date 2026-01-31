/**
 * Spacer component to prevent content from being hidden behind the fixed header.
 * Must be placed immediately after the Header component on every page.
 */
const HeaderSpacer = () => {
  return <div className="h-[120px] md:h-[140px]" />;
};

export default HeaderSpacer;
