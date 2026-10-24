-- ====================================================================
-- NETPULSE SUPABASE SEED DATA (Curriculum Achievement Catalog)
-- Course: Probability and Statistics for Computer Science (25CS203)
-- Safe, repeatable static catalog seed (ON CONFLICT DO NOTHING)
-- ====================================================================

INSERT INTO public.achievements (id, name, description, icon, xp_reward, created_at)
VALUES
    ('first_analysis', 'First Telemetry Analysis', 'Execute your first network load statistical analysis through the FastAPI statistical engine.', 'Activity', 50, NOW()),
    ('zscore_master', 'Z-Score Standardization Master', 'Calculate 5 standardized Z-scores with 100% mathematical accuracy.', 'Target', 100, NOW()),
    ('distribution_explorer', 'Gaussian Bell Explorer', 'Investigate all standard deviation intervals (±1σ, ±2σ, ±3σ) on the Gaussian probability curve.', 'Compass', 75, NOW()),
    ('anomaly_hunter', 'Outlier Sentinel', 'Identify and isolate 3 empirical burst anomalies (|Z| > 2.0) in raw campus telemetry.', 'AlertTriangle', 100, NOW()),
    ('probability_master', 'Cumulative Probability Solver', 'Evaluate 5 cumulative tail and interval probability queries using SciPy norm.cdf().', 'Percent', 125, NOW()),
    ('traffic_controller', 'Campus Traffic Controller', 'Successfully resolve 3 escalating congestion events in the Learn & Play simulator.', 'Shield', 100, NOW()),
    ('network_analyst', 'Senior NOC Analyst', 'Maintain a healthy campus network with >90 health score across 5 consecutive observation periods.', 'Award', 150, NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    xp_reward = EXCLUDED.xp_reward;
