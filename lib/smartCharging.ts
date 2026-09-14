export type SmartChargingRecommendation = {
  message: string;
  currentPrice: number;
  savingsPercent: number;
};

/**
 * currentHour = now
 * remainingHours = today's hourly prices from currentHour onwards
 * cheapestHour = hour with lowest price in remaining hours
 * savings = (currentPrice - cheapestPrice) / currentPrice * 100
 * if savings > 20%: "Wait until {hour} to save {savings}%"
 * else: "Current price is reasonable"
 */
export function getSmartChargingRecommendation(
  hourly: number[] | undefined
): SmartChargingRecommendation | null {
  if (!hourly || hourly.length === 0) return null;

  const currentIndex = Math.min(new Date().getUTCHours(), hourly.length - 1);
  const currentPrice = hourly[currentIndex];
  if (currentPrice <= 0) {
    return { message: "Current price is reasonable", currentPrice, savingsPercent: 0 };
  }

  let cheapestIndex = currentIndex;
  let cheapestPrice = currentPrice;
  for (let i = currentIndex; i < hourly.length; i++) {
    if (hourly[i] < cheapestPrice) {
      cheapestPrice = hourly[i];
      cheapestIndex = i;
    }
  }

  const savingsPercent = ((currentPrice - cheapestPrice) / currentPrice) * 100;

  if (savingsPercent > 20) {
    return {
      message: `Wait until ${cheapestIndex}:00 to save ${savingsPercent.toFixed(0)}%`,
      currentPrice,
      savingsPercent,
    };
  }
  return { message: "Current price is reasonable", currentPrice, savingsPercent };
}
