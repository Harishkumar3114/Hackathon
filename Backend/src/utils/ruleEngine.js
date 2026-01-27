export const evaluateRules = (links, context) => {
  return links.filter((link) => {
    if (!link.rules || link.rules.length === 0) return true;

    // 1. Group rules by their type (time, location, device)
    const groupedRules = link.rules.reduce((acc, rule) => {
      acc[rule.type] = acc[rule.type] || [];
      acc[rule.type].push(rule);
      return acc;
    }, {});

    // 2. Evaluate each group
    // Every DIFFERENT type must pass (AND)
    return Object.keys(groupedRules).every((type) => {
      const rulesInGroup = groupedRules[type];

      // At least ONE rule in a group must pass (OR)
      return rulesInGroup.some((rule) => {
        switch (rule.type) {
          case "device":
            return context.device === rule.config.allowedDevice;
          case "location":
            return context.location.country === rule.config.allowedCountry;
          case "time":
            const { startHour, endHour } = rule.config;
            const current = context.timeHour;
            if (startHour <= endHour) {
              return current >= startHour && current < endHour;
            } else {
              return current >= startHour || current < endHour;
            }
          default:
            return true;
        }
      });
    });
  }).sort((a, b) => {
    // Priority and Click Tie-breaker remains the same
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (b.clickCount !== a.clickCount) return b.clickCount - a.clickCount;
    return a.label.localeCompare(b.label);
  });
};