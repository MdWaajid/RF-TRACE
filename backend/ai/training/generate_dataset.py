import typing as t
import numpy as np
from scipy import signal
from backend.ai.model import MODULATION_CLASSES


def rrc_filter(sps: int = 4, alpha: float = 0.35, span: int = 6) -> np.ndarray:
    """Generates Root-Raised Cosine (RRC) pulse shaping filter coefficients."""
    n = np.arange(-span * sps, span * sps + 1)
    h = np.zeros(len(n))
    for i, t in enumerate(n):
        if t == 0:
            h[i] = 1.0 - alpha + (4 * alpha / np.pi)
        elif abs(t) == sps / (4 * alpha):
            h[i] = (alpha / np.sqrt(2)) * (
                (1 + 2 / np.pi) * np.sin(np.pi / (4 * alpha))
                + (1 - 2 / np.pi) * np.cos(np.pi / (4 * alpha))
            )
        else:
            t_s = t / sps
            num = np.sin(np.pi * t_s * (1 - alpha)) + 4 * alpha * t_s * np.cos(
                np.pi * t_s * (1 + alpha)
            )
            den = np.pi * t_s * (1 - (4 * alpha * t_s) ** 2)
            h[i] = num / den
    return h / np.sqrt(np.sum(h**2))


def generate_single_iq_frame(
    mod_name: str,
    seq_len: int = 1024,
    snr_db: float = 15.0,
    freq_offset_hz: float = 0.0,
    phase_offset_rad: float = 0.0,
    sps: int = 4,
) -> np.ndarray:
    """Generates synthetic complex I/Q frame with realistic pulse shaping and impairments."""
    mod = mod_name.upper()
    num_symbols = (seq_len // sps) + 16

    if mod == "BPSK":
        bits = np.random.randint(0, 2, num_symbols)
        symbols = (2 * bits - 1.0) + 0j
    elif mod == "QPSK":
        bits_i = np.random.randint(0, 2, num_symbols)
        bits_q = np.random.randint(0, 2, num_symbols)
        scale = 1.0 / np.sqrt(2.0)
        symbols = scale * ((2 * bits_i - 1) + 1j * (2 * bits_q - 1))
    elif mod == "8PSK":
        sym_idx = np.random.randint(0, 8, num_symbols)
        symbols = np.exp(1j * 2 * np.pi * sym_idx / 8)
    elif mod in ["FSK", "2FSK"]:
        bits = np.random.randint(0, 2, num_symbols)
        freqs = (2 * bits - 1) * (0.05 / sps)
        phase = np.cumsum(np.repeat(freqs, sps))[:seq_len]
        symbols_upsampled = np.exp(1j * 2 * np.pi * phase)
    elif mod == "16QAM":
        i_idx = np.random.choice([-3, -1, 1, 3], num_symbols)
        q_idx = np.random.choice([-3, -1, 1, 3], num_symbols)
        scale = 1.0 / np.sqrt(10.0)
        symbols = scale * (i_idx + 1j * q_idx)
    else:
        bits_i = np.random.randint(0, 2, num_symbols)
        bits_q = np.random.randint(0, 2, num_symbols)
        scale = 1.0 / np.sqrt(2.0)
        symbols = scale * ((2 * bits_i - 1) + 1j * (2 * bits_q - 1))

    if mod not in ["FSK", "2FSK"]:
        # Upsample symbols by SPS
        upsampled = np.zeros(num_symbols * sps, dtype=complex)
        upsampled[::sps] = symbols
        # Apply RRC pulse shaping filter
        pulse_filter = rrc_filter(sps=sps)
        filtered_i = np.convolve(np.real(upsampled), pulse_filter, mode="same")
        filtered_q = np.convolve(np.imag(upsampled), pulse_filter, mode="same")
        iq_wave = (filtered_i + 1j * filtered_q)[:seq_len]
    else:
        iq_wave = symbols_upsampled[:seq_len]

    # Apply frequency offset and phase shift
    t = np.arange(seq_len)
    phase_rotation = np.exp(1j * (2 * np.pi * freq_offset_hz * t + phase_offset_rad))
    impaired_iq = iq_wave * phase_rotation

    # Add AWGN noise
    snr_linear = 10.0 ** (snr_db / 10.0)
    sig_power = np.mean(np.abs(impaired_iq) ** 2)
    noise_power = sig_power / snr_linear if snr_linear > 0 else 0.01
    noise_i = np.random.normal(0, np.sqrt(noise_power / 2.0), seq_len)
    noise_q = np.random.normal(0, np.sqrt(noise_power / 2.0), seq_len)
    noisy_iq = impaired_iq + (noise_i + 1j * noise_q)

    # Normalize amplitude
    max_val = np.max(np.abs(noisy_iq))
    if max_val > 1e-6:
        noisy_iq = noisy_iq / max_val

    return noisy_iq


def generate_synthetic_dataset(
    num_samples_per_class: int = 400, seq_len: int = 1024
) -> t.Tuple[np.ndarray, np.ndarray]:
    """Generates realistic oversampled synthetic dataset (X, y) for training PyTorch model."""
    X_list = []
    y_list = []

    for class_idx, mod_name in enumerate(MODULATION_CLASSES):
        for _ in range(num_samples_per_class):
            snr = float(np.random.uniform(2.0, 25.0))
            freq_offset = float(np.random.uniform(-0.005, 0.005))
            phase_offset = float(np.random.uniform(0, 2 * np.pi))
            sps = int(np.random.choice([2, 4, 8]))

            iq_frame = generate_single_iq_frame(
                mod_name,
                seq_len=seq_len,
                snr_db=snr,
                freq_offset_hz=freq_offset,
                phase_offset_rad=phase_offset,
                sps=sps,
            )

            iq_tensor_data = np.stack([np.real(iq_frame), np.imag(iq_frame)], axis=0)
            X_list.append(iq_tensor_data)
            y_list.append(class_idx)

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list, dtype=np.int64)

    indices = np.arange(len(y))
    np.random.shuffle(indices)
    return X[indices], y[indices]
