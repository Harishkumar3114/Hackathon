export const evaluateRules = (links, context) => {
  // 1. FILTERING (Only show links that match rules)
  const visibleLinks = links.filter((link) => {
    if (!link.rules || link.rules.length === 0) return true;

    // Standard every() check for rules
    return link.rules.every((rule) => {
      switch (rule.type) {
        case "device":
          return context.device === rule.config.allowedDevice;
        case "location":
          return context.location.country === rule.config.allowedCountry;
        case "time":
          const { startHour, endHour } = rule.config;

          if (startHour < endHour) {
            // Normal: 9 AM (9) to 5 PM (17)
            return context.timeHour >= startHour && context.timeHour < endHour;
          } else {
            // Wrap-around: 9 PM (21) to 5 AM (5)
            // It's valid if it's AFTER start OR BEFORE end
            return context.timeHour >= startHour || context.timeHour < endHour;
          }
        default:
          return true;
      }
    });
  });

  // 2. INTELLIGENT SORTING (The Tie-Breaker)
  return visibleLinks.sort((a, b) => {
    // Primary: Sort by Priority (Highest first)
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }

    // Secondary: Sort by Clicks (Intelligence Tie-breaker)
    // This moves Link B (3 clicks) above Link A (0 clicks)
    if (b.clickCount !== a.clickCount) {
      return b.clickCount - a.clickCount;
    }

    // Tertiary: Alphabetical just in case
    return a.label.localeCompare(b.label);
  });
};
