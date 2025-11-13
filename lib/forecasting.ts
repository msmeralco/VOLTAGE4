// Load forecasting helpers (EWMA-based)

export interface ForecastPoint {
  hour: number;
  offsetHours: number;
  timestamp: string;
  predictedLoadKw: number;
  baselineLoadKw: number;
  adjustmentKw: number;
  riskRatio: number;
  riskLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
}

export interface PeakRiskInfo {
  hour: number;
  offsetHours: number;
  timestamp: string;
  predictedLoadKw: number;
  riskRatio: number;
  riskLevel: ForecastPoint["riskLevel"];
}

export interface OverloadAlert {
  alertType: "PREDICTIVE_OVERLOAD";
  firstCriticalHour: number;
  hoursAhead: number;
  predictedLoadKw: number;
  riskRatio: number;
  confidence: number;
  criticalHoursCount: number;
  recommendedAction: string;
}

export class EWMAForecaster {
  private hourlyBaseline: Record<number, number> = {};

  constructor(private alpha = 0.5) {}

  setBaseline(hourlyAverages: Record<number, number>) {
    this.hourlyBaseline = hourlyAverages;
  }

  generateBaselineFromPattern({
    peakHour = 19,
    peakLoad = 150,
    baseLoad = 80,
  }: {
    peakHour?: number;
    peakLoad?: number;
    baseLoad?: number;
  } = {}) {
    const baseline: Record<number, number> = {};
    for (let hour = 0; hour < 24; hour++) {
      const phase = ((hour - peakHour) * 2 * Math.PI) / 24;
      const variation = (peakLoad - baseLoad) / 2;
      baseline[hour] = baseLoad + variation * (1 + Math.cos(phase));
    }
    this.hourlyBaseline = baseline;
  }

  forecast24h(currentHour: number, recentMeanKw: number, transformerCapacityKw: number): ForecastPoint[] {
    if (!Object.keys(this.hourlyBaseline).length) {
      throw new Error("Baseline not set. Call setBaseline() first.");
    }

    const baselineCurrent = this.hourlyBaseline[currentHour];
    const adjustment = this.alpha * (recentMeanKw - baselineCurrent);

    const predictions: ForecastPoint[] = [];

    for (let offset = 0; offset < 24; offset++) {
      const futureHour = (currentHour + offset) % 24;
      const futureTimestamp = new Date(Date.now() + offset * 3600 * 1000);

      const baselineLoad = this.hourlyBaseline[futureHour];
      const decayFactor = Math.exp(-offset / 12);
      const adjustedLoad = Math.max(0, baselineLoad + adjustment * decayFactor);
      const riskRatio = transformerCapacityKw > 0 ? adjustedLoad / transformerCapacityKw : 0;

      predictions.push({
        hour: futureHour,
        offsetHours: offset,
        timestamp: futureTimestamp.toISOString(),
        predictedLoadKw: Number(adjustedLoad.toFixed(2)),
        baselineLoadKw: Number(baselineLoad.toFixed(2)),
        adjustmentKw: Number((adjustment * decayFactor).toFixed(2)),
        riskRatio: Number(riskRatio.toFixed(3)),
        riskLevel: this.classifyRisk(riskRatio),
      });
    }

    return predictions;
  }

  findPeakRisk(predictions: ForecastPoint[]): PeakRiskInfo | null {
    if (!predictions.length) return null;
    const peak = predictions.reduce((max, point) => (point.riskRatio > max.riskRatio ? point : max), predictions[0]);
    return {
      hour: peak.hour,
      offsetHours: peak.offsetHours,
      timestamp: peak.timestamp,
      predictedLoadKw: peak.predictedLoadKw,
      riskRatio: peak.riskRatio,
      riskLevel: peak.riskLevel,
    };
  }

  assessOverloadRisk(
    predictions: ForecastPoint[],
    criticalThreshold = 0.9,
    minLeadTimeHours = 2
  ): OverloadAlert | null {
    const criticalHours = predictions.filter(
      (point) => point.riskRatio >= criticalThreshold && point.offsetHours >= minLeadTimeHours
    );

    if (!criticalHours.length) {
      return null;
    }

    const firstCritical = criticalHours.reduce((min, point) =>
      point.offsetHours < min.offsetHours ? point : min
    );

    const excessRatio = firstCritical.riskRatio - criticalThreshold;
    const confidence = Math.min(0.95, 0.6 + excessRatio / 0.2);

    return {
      alertType: "PREDICTIVE_OVERLOAD",
      firstCriticalHour: firstCritical.hour,
      hoursAhead: firstCritical.offsetHours,
      predictedLoadKw: firstCritical.predictedLoadKw,
      riskRatio: firstCritical.riskRatio,
      confidence: Number(confidence.toFixed(3)),
      criticalHoursCount: criticalHours.length,
      recommendedAction: this.generateRecommendation(firstCritical),
    };
  }

  private classifyRisk(riskRatio: number): ForecastPoint["riskLevel"] {
    if (riskRatio >= 0.95) return "CRITICAL";
    if (riskRatio >= 0.85) return "HIGH";
    if (riskRatio >= 0.75) return "MODERATE";
    return "LOW";
  }

  private generateRecommendation(point: ForecastPoint): string {
    const hoursAhead = point.offsetHours;
    const riskRatio = point.riskRatio;

    let actionPrefix = "ADVISORY: Voluntary load reduction recommended. ";
    if (riskRatio >= 0.98) actionPrefix = "URGENT: Pre-stage crew for immediate intervention. ";
    else if (riskRatio >= 0.92) actionPrefix = "WARNING: Monitor closely and prepare load management. ";

    let timing = `Expected in ${hoursAhead} hours - immediate action required.`;
    if (hoursAhead >= 6) timing = `Expected in ${hoursAhead} hours - plan scheduled response.`;
    else if (hoursAhead >= 3) timing = `Expected in ${hoursAhead} hours - coordinate with barangay officials.`;

    return actionPrefix + timing;
  }
}
