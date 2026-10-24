"""
NETPULSE Statistical Services Package
Course: Probability and Statistics for Computer Science (25CS203)
"""

from services.statistics import (
    calculate_mean,
    calculate_variance,
    calculate_std_dev,
    calculate_z_score,
    compute_telemetry_summary,
    load_telemetry_from_csv,
    validate_telemetry_data,
    EmptyDatasetError,
    InsufficientDataError
)

from services.probability import (
    calculate_cdf,
    calculate_upper_tail,
    calculate_interval_probability,
    z_to_probability,
    probability_to_z,
    calculate_probability_region,
    generate_normal_pdf_coordinates
)

from services.anomaly import (
    classify_z_score,
    is_anomaly,
    classify_network_load,
    detect_anomalies_in_dataset,
    ANOMALY_THRESHOLD_LOW,
    ANOMALY_THRESHOLD_HIGH,
    STATUS_NORMAL,
    STATUS_UNUSUALLY_HIGH,
    STATUS_UNUSUALLY_LOW
)

from services.health import (
    calculate_health_score,
    get_health_band,
    evaluate_network_health,
    BAND_EXCELLENT,
    BAND_HEALTHY,
    BAND_WARNING,
    BAND_POOR,
    BAND_CRITICAL
)

from services.explanation import (
    explain_mean,
    explain_variance,
    explain_std_dev,
    explain_z_score,
    explain_probability,
    explain_anomaly_classification,
    explain_health_score,
    build_full_explanation
)

from services.simulator import (
    simulate_load_point,
    generate_what_if_sweep
)

from services.progression_engine import (
    calculate_level,
    get_level_title,
    evaluate_achievement_eligibility,
    ACHIEVEMENTS_CATALOG
)

from services.supabase_auth import (
    verify_supabase_token,
    get_current_user,
    get_optional_user
)

from services.supabase_client import (
    record_authoritative_game_completion,
    save_authoritative_analysis,
    get_user_analysis_history,
    get_authoritative_leaderboard,
    get_user_progression_summary,
    get_memory_db
)

__all__ = [
    "calculate_mean",
    "calculate_variance",
    "calculate_std_dev",
    "calculate_z_score",
    "compute_telemetry_summary",
    "load_telemetry_from_csv",
    "validate_telemetry_data",
    "EmptyDatasetError",
    "InsufficientDataError",
    "calculate_cdf",
    "calculate_upper_tail",
    "calculate_interval_probability",
    "z_to_probability",
    "probability_to_z",
    "calculate_probability_region",
    "generate_normal_pdf_coordinates",
    "classify_z_score",
    "is_anomaly",
    "classify_network_load",
    "detect_anomalies_in_dataset",
    "ANOMALY_THRESHOLD_LOW",
    "ANOMALY_THRESHOLD_HIGH",
    "STATUS_NORMAL",
    "STATUS_UNUSUALLY_HIGH",
    "STATUS_UNUSUALLY_LOW",
    "calculate_health_score",
    "get_health_band",
    "evaluate_network_health",
    "BAND_EXCELLENT",
    "BAND_HEALTHY",
    "BAND_WARNING",
    "BAND_POOR",
    "BAND_CRITICAL",
    "explain_mean",
    "explain_variance",
    "explain_std_dev",
    "explain_z_score",
    "explain_probability",
    "explain_anomaly_classification",
    "explain_health_score",
    "build_full_explanation",
    "simulate_load_point",
    "generate_what_if_sweep"
]
