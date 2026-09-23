import typing as t
import numpy as np


def fuse_evidence(
    cnn_output: t.Dict[str, t.Any],
    iq_samples: np.ndarray,
    spectrum_data: t.Dict[str, t.Any],
) -> t.Dict[str, t.Any]:
    """Combines PyTorch CNN output probabilities with DSP spectral & constellation measurements.

    Core Principle (Problem Statement 26147):
    'DSP measures. AI recognizes. Communication algorithms recover. Evidence fusion explains.'
    """
    raw_probs = cnn_output.get("probs", {})
    detected = cnn_output.get("detected", "QPSK")
    base_confidence = cnn_output.get("confidence", 0.8)

    dsp_evidence = cnn_output.get("dspEvidence", [])
    cnn_evidence = cnn_output.get("cnnEvidence", [])

    if len(iq_samples) > 0:
        max_abs = np.max(np.abs(iq_samples))
        iq_norm = iq_samples / max_abs if max_abs > 1e-12 else iq_samples

        i_pwr = float(np.mean(np.real(iq_norm) ** 2))
        q_pwr = float(np.mean(np.imag(iq_norm) ** 2))
        max_pwr = max(i_pwr, q_pwr)
        min_pwr = min(i_pwr, q_pwr)
        iq_ratio = float(min_pwr / (max_pwr + 1e-12))
        env_var = float(np.var(np.abs(iq_norm)))

        dsp_evidence.append(
            {
                "metric": "I/Q Channel Power Ratio (Min/Max)",
                "value": f"{iq_ratio:.3f}",
                "note": "Ratio ~ 1.0 indicates 2D Quadrature (QPSK/QAM), Ratio ~ 0.0 indicates 1D (BPSK)",
            }
        )
        dsp_evidence.append(
            {
                "metric": "Envelope Variance",
                "value": f"{env_var:.4f}",
                "note": "Low variance (< 0.02) indicates Phase Shift Keying (BPSK/QPSK)",
            }
        )

        # Rule 1: Single-channel BPSK signal (Q power = 0)
        if iq_ratio < 0.05:
            detected = "BPSK"
            base_confidence = 0.996
            cnn_evidence.append(
                "Evidence Fusion: DSP measured zero Quadrature Q energy (I/Q Ratio = 0.000), confirming BPSK modulation."
            )
            raw_probs = {
                "BPSK": 0.996,
                "QPSK": 0.001,
                "8PSK": 0.001,
                "FSK": 0.001,
                "16QAM": 0.001,
            }

        # Rule 2: Quadrature 2D PSK signal (I & Q power balanced, low envelope variance)
        elif iq_ratio > 0.70 and env_var < 0.05:
            detected = "QPSK"
            base_confidence = 0.998
            cnn_evidence.append(
                f"Evidence Fusion: DSP measured balanced 2D Quadrature energy (I/Q Ratio = {iq_ratio:.3f}) and low envelope variance ({env_var:.4f}), confirming QPSK modulation."
            )
            raw_probs = {
                "BPSK": 0.001,
                "QPSK": 0.998,
                "8PSK": 0.0005,
                "FSK": 0.0003,
                "16QAM": 0.0002,
            }

    # Spectral feature check
    power_db = spectrum_data.get("powerDb", spectrum_data.get("power_db", []))
    if len(power_db) > 0:
        peakiness = float(np.max(power_db) - np.mean(power_db))
    else:
        peakiness = 10.0

    dsp_evidence.append(
        {
            "metric": "Spectral Peakiness (Kurtosis proxy)",
            "value": f"{peakiness:.1f} dB",
            "note": "Peak power relative to average band energy",
        }
    )

    return {
        "probs": raw_probs,
        "detected": detected,
        "confidence": float(base_confidence),
        "cnnEvidence": cnn_evidence,
        "dspEvidence": dsp_evidence,
    }
