# NetPulse Statistical Methodology
**Course:** Probability and Statistics for Computer Science (25CS203)

---

## 1. Descriptive Statistics

### Arithmetic Sample Mean ($\bar{x}$ or $\mu$)
$$\bar{x} = \frac{1}{n}\sum_{i=1}^n x_i$$
Implemented using `numpy.mean(data)`. Represents the central operational baseline of campus network load.

### Sample Variance ($s^2$) with Bessel's Correction
$$s^2 = \frac{1}{n - 1}\sum_{i=1}^n (x_i - \bar{x})^2$$
Implemented using `numpy.var(data, ddof=1)`. Applies Bessel's correction ($n-1$ in denominator) to eliminate downward bias when estimating population variance from sampled telemetry.

### Sample Standard Deviation ($s$)
$$s = \sqrt{s^2}$$
Implemented using `numpy.std(data, ddof=1)`. Measures load dispersion around the mean in native throughput units (Mbps).

---

## 2. Standardized Score (Z-Score)
$$Z = \frac{X - \mu}{\sigma}$$
Where $X$ is the observed network load in Mbps, $\mu$ is the baseline average load, and $\sigma$ is the standard deviation.

### Zero-Variance Safety Guard
If $\sigma = 0$ (e.g. all telemetry observations are identical or dataset has zero dispersion), computing $\frac{X - \mu}{\sigma}$ would produce a division-by-zero or `NaN`. NetPulse guards against this by returning $Z = 0.0$ when $\sigma \le 10^{-9}$.

---

## 3. Gaussian Probability Distribution (SciPy norm)

### Probability Density Function (PDF)
$$f(x) = \frac{1}{\sigma \sqrt{2\pi}} e^{-\frac{1}{2}\left(\frac{x - \mu}{\sigma}\right)^2}$$
Computed using `scipy.stats.norm.pdf(x, loc=mean, scale=std)`. Used by the Technical Lab and What-If Simulator to render continuous bell curve coordinates.

### Cumulative Distribution Function (Lower Tail)
$$P(X \le x) = \Phi\left(\frac{x - \mu}{\sigma}\right) = \frac{1}{\sqrt{2\pi}} \int_{-\infty}^{\frac{x-\mu}{\sigma}} e^{-t^2/2} dt$$
Computed using `scipy.stats.norm.cdf(x, loc=mean, scale=std)`.

### Survival Function (Upper Tail)
$$P(X \ge x) = 1 - P(X \le x)$$
Computed using `scipy.stats.norm.sf(x, loc=mean, scale=std)` for numerical stability in the extreme tail.

### Interval Probability
$$P(a \le X \le b) = \Phi\left(\frac{b - \mu}{\sigma}\right) - \Phi\left(\frac{a - \mu}{\sigma}\right) = \text{CDF}(b) - \text{CDF}(a)$$

---

## 4. Anomaly Classification Framework
NetPulse selects a project-level threshold of $\pm 2.0$ standard deviations:
- **$Z < -2.0 \implies$ UNUSUALLY LOW:** Potential routing failure, packet drop, or severed campus link.
- **$-2.0 \le Z \le +2.0 \implies$ NORMAL:** Nominal operating load; covers approximately 95.45% of expected telemetry under Gaussian assumptions.
- **$Z > +2.0 \implies$ UNUSUALLY HIGH:** Traffic surge, denial-of-service attempt, or high-concurrency streaming.

---

## 5. Network Health Score Formula
$$H = \max\left(0, \min\left(100, \text{round}\left(100 - 25 \times \max(0, |Z| - 1)\right)\right)\right)$$

### Operational Health Bands
- **90–100 $\implies$ Excellent:** Optimal operational headroom ($|Z| \le 1.4$).
- **70–89 $\implies$ Healthy:** Nominal variance within the $\pm 2.0\sigma$ envelope.
- **50–69 $\implies$ Warning:** Elevated variance approaching or crossing the anomaly threshold.
- **30–49 $\implies$ Poor:** Significant deviation ($|Z| \in [3.0, 3.8]$).
- **0–29 $\implies$ Critical:** Severe statistical breach ($|Z| > 3.84$) or total connection outage.

> **Academic Note:** This score is an application-level composite index specifically formulated for the NetPulse educational platform. It is not an international ISO standard.

---

## 6. Baseline Dataset Specification (`campus_network.csv`)

The baseline campus network dataset (`backend/data/network_load.csv`) represents a full 24-hour continuous surveillance profile sampled at 1-hour intervals:

- **Sample Size ($n$):** $24$ hourly telemetry records (`00:00` to `23:00`)
- **Sample Mean ($\bar{x}$):** $39.7667\text{ Mbps} \approx 39.77\text{ Mbps}$
- **Sample Variance ($s^2$, $ddof=1$):** $195.2380\text{ Mbps}^2 \approx 195.24\text{ Mbps}^2$
- **Sample Standard Deviation ($s$, $ddof=1$):** $13.9728\text{ Mbps} \approx 13.97\text{ Mbps}$
- **Minimum Throughput:** $16.40\text{ Mbps}$ (recorded at `03:00` idle night window)
- **Maximum Throughput:** $62.00\text{ Mbps}$ (recorded at `15:00` afternoon peak — the project's Golden Benchmark)
- **Golden Case Standardization:** At $X = 62.0\text{ Mbps}$, $Z = \frac{62.0 - 39.7667}{13.9728} = +1.5912\sigma$. Under Gaussian modeling, $P(X \le 62.0) = 0.9442$, $P(X \ge 62.0) = 0.0558$, Anomaly Status = `NORMAL`, Health Score = $85$ (`Healthy`).
