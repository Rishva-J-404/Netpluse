/**
 * NETPULSE - The Golden Bridge Protocol
 * Connects Game outcomes (Phase 6) and Technical Lab tools (Phase 5).
 * Course: Probability and Statistics for Computer Science (25CS203)
 */

export function createBridgePayload({
  scenarioId,
  gameId,
  title,
  currentLoad,
  mean,
  stdDev,
  zScore,
  probabilityBelow,
  status,
  healthScore,
  healthBand,
  zFormula,
  explanation
}) {
  return {
    scenarioId: scenarioId || 'scenario_custom',
    gameId: gameId || 'technical_workbench',
    title: title || 'Custom Telemetry Evaluation',
    currentLoad: Number(currentLoad),
    mean: Number(mean),
    stdDev: Number(stdDev),
    zScore: Number(zScore),
    probabilityBelow: Number(probabilityBelow),
    status: status || 'NORMAL',
    healthScore: Number(healthScore),
    healthBand: healthBand || 'Healthy',
    zFormula: zFormula || `Z = (${currentLoad} - ${mean}) / ${stdDev}`,
    explanation: explanation || '',
    transferredAt: new Date().toISOString()
  }
}
