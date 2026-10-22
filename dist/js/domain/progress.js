function parseDate(date) {
  return new Date(`${date}T12:00:00Z`);
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function weekStart(dateString) {
  const date = parseDate(dateString);
  const day = date.getUTCDay();
  const distance = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + distance);
  return formatDate(date);
}

export function calculateGoalProgress(startWeight, currentWeight, targetWeight) {
  const distance = targetWeight - startWeight;
  if (distance <= 0) return 100;
  return Math.min(100, Math.max(0, ((currentWeight - startWeight) / distance) * 100));
}

export function groupWeeklyAverages(weights) {
  const grouped = new Map();
  for (const weight of weights) {
    const key = weekStart(weight.date);
    const group = grouped.get(key) ?? [];
    group.push(weight.value);
    grouped.set(key, group);
  }

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, values]) => ({
      weekStart: date,
      average: values.reduce((sum, value) => sum + value, 0) / values.length,
      count: values.length,
    }));
}

export function classifyWeeklyRate(weeklyAverages, targetRate = 0.5) {
  if (weeklyAverages.length < 2) return { status: "insufficient", rate: null };
  const previous = weeklyAverages.at(-2);
  const current = weeklyAverages.at(-1);
  let elapsedWeeks = 1;
  if (previous.weekStart && current.weekStart) {
    elapsedWeeks = Math.max(1, Math.round((parseDate(current.weekStart) - parseDate(previous.weekStart)) / 604800000));
  }
  const rate = (current.average - previous.average) / elapsedWeeks;
  const lower = targetRate - 0.1;
  const upper = targetRate + 0.1;
  if (rate < lower) return { status: "below", rate };
  if (rate > upper) return { status: "above", rate };
  return { status: "on-track", rate };
}
