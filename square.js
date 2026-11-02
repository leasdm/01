
  // Maximale öffentliche Anzeigedauer: 12 Monate
  function twelveMonthsAgo(now) {
    const date = new Date(now.getTime());
    const day = date.getUTCDate();

    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() - 12);

    const lastDay = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      0
    )).getUTCDate();

    date.setUTCDate(Math.min(day, lastDay));

    return date.getTime();
  }

  function isWithinDisplayPeriod(item) {
    const timestamp = Date.parse(
      item && item.purchasedAt
    );

    const now = Date.now();

    return Number.isFinite(timestamp) &&
      timestamp >= twelveMonthsAgo(new Date(now)) &&
      timestamp <= now;
  }
