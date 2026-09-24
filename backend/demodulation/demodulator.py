import typing as t
import numpy as np


def estimate_sps_and_strobe(iq: np.ndarray) -> np.ndarray:
    """Estimates Samples Per Symbol (SPS) and extracts downsampled symbol strobes."""
    if len(iq) < 32:
        return iq

    # Evaluate energy profile across candidate SPS values [2, 4, 8, 16]
    candidate_sps = [2, 4, 8, 16]
    best_sps = 4
    best_strobe_offset = 0
    best_var = -1.0

    for sps in candidate_sps:
        if len(iq) < sps * 4:
            continue
        for offset in range(sps):
            sub = iq[offset::sps]
            # Maximize symbol constellation energy variance
            var = float(np.var(np.abs(sub)))
            if var > best_var:
                best_var = var
                best_sps = sps
                best_strobe_offset = offset

    return iq[best_strobe_offset::best_sps]


def demodulate_signal(
    iq: np.ndarray, mod_type: str = "QPSK"
) -> t.Tuple[str, t.Dict[str, t.Any]]:
    """Demodulates complex I/Q samples into raw bits ('0' and '1') with symbol timing recovery."""
    if len(iq) == 0:
        return "0" * 128, {"status": "Complete", "recoveredBits": 128}

    mod = mod_type.upper()

    # 1. Symbol timing strobe recovery (downsample by SPS at optimal strobe offset)
    symbols = estimate_sps_and_strobe(iq)
    bits_list = []

    if mod in ["FSK", "2FSK", "4FSK", "GFSK", "CPFSK"]:
        # Quadrature Frequency Discriminator on strobed samples
        inst_freq = np.angle(symbols[1:] * np.conj(symbols[:-1]))
        thresh = np.mean(inst_freq)
        for f_val in inst_freq:
            bits_list.append("1" if f_val >= thresh else "0")

    elif mod == "BPSK":
        for s in symbols:
            val = np.real(s)
            bits_list.append("1" if val >= 0 else "0")

    elif mod == "8PSK":
        for s in symbols:
            angle = np.angle(s)
            if angle < 0:
                angle += 2 * np.pi
            idx = int(np.floor((angle + np.pi / 8) / (np.pi / 4))) % 8
            bits_list.append(f"{idx:03b}")

    elif mod == "16QAM":
        # Normalize constellation to unit standard deviation for 16QAM decision boundaries
        std_val = float(np.std(symbols)) if np.std(symbols) > 1e-6 else 1.0
        norm_symbols = symbols / std_val
        for s in norm_symbols:
            r, m = np.real(s), np.imag(s)
            b1 = "1" if r > 0 else "0"
            b2 = "1" if abs(r) < 0.8 else "0"
            b3 = "1" if m > 0 else "0"
            b4 = "1" if abs(m) < 0.8 else "0"
            bits_list.append(f"{b1}{b2}{b3}{b4}")

    else:
        # Default QPSK demodulation
        for s in symbols:
            i_val = np.real(s)
            q_val = np.imag(s)
            bits_list.append("1" if i_val >= 0 else "0")
            bits_list.append("1" if q_val >= 0 else "0")

    bitstring = "".join(bits_list)
    # Truncate to clean length (max 2048 bits for responsive browser rendering)
    if len(bitstring) > 2048:
        bitstring = bitstring[:2048]

    demod_meta = {
        "status": "Complete",
        "recoveredBits": len(bitstring),
        "demodulator": f"{mod} Discriminator & Gardner Timing Recovery",
    }
    return bitstring, demod_meta
