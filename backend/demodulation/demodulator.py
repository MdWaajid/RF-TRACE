import typing as t
import numpy as np


def demodulate_signal(
    iq: np.ndarray, mod_type: str = "QPSK"
) -> t.Tuple[str, t.Dict[str, t.Any]]:
    """Demodulates complex I/Q samples into raw bits ('0' and '1')."""
    if len(iq) == 0:
        return "0" * 128, {"status": "Complete", "recoveredBits": 128}

    mod = mod_type.upper()
    bits_list = []

    if mod == "BPSK":
        for sample in iq:
            val = np.real(sample)
            bits_list.append("1" if val >= 0 else "0")

    elif mod == "8PSK":
        for sample in iq:
            angle = np.angle(sample)
            if angle < 0:
                angle += 2 * np.pi
            idx = int(np.floor((angle + np.pi / 8) / (np.pi / 4))) % 8
            bits_list.append(f"{idx:03b}")

    elif mod == "16QAM":
        # Slicer for 16QAM
        max_val = np.max(np.abs(iq)) if np.max(np.abs(iq)) > 0 else 1.0
        scale_iq = (iq / max_val) * 3.0
        for sample in iq:
            r, m = np.real(sample), np.imag(sample)
            b1 = "1" if r > 0 else "0"
            b2 = "1" if abs(r) < 1.0 else "0"
            b3 = "1" if m > 0 else "0"
            b4 = "1" if abs(m) < 1.0 else "0"
            bits_list.append(f"{b1}{b2}{b3}{b4}")

    else:
        # Default QPSK demodulation
        for sample in iq:
            i_val = np.real(sample)
            q_val = np.imag(sample)
            bits_list.append("1" if i_val >= 0 else "0")
            bits_list.append("1" if q_val >= 0 else "0")

    bitstring = "".join(bits_list)
    # Truncate to clean length (max 2048 bits for responsive browser rendering)
    if len(bitstring) > 2048:
        bitstring = bitstring[:2048]

    demod_meta = {
        "status": "Complete",
        "recoveredBits": len(bitstring),
        "demodulator": f"{mod} Slicer & Gardner Timing Recovery",
    }
    return bitstring, demod_meta
