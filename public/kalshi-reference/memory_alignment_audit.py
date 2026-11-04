"""Check that a NumPy buffer starts on a 64-byte (cache-line) boundary."""
from __future__ import annotations

import numpy as np

ALIGN = 64


def is_aligned(arr: np.ndarray, align: int = ALIGN) -> bool:
    return arr.ctypes.data % align == 0


def aligned_empty(n: int, dtype: type = np.float64, align: int = ALIGN) -> np.ndarray:
    """Allocate n items whose data pointer is `align`-byte aligned."""
    itemsize = np.dtype(dtype).itemsize
    raw = np.empty(n * itemsize + align, dtype=np.uint8)
    offset = (-raw.ctypes.data) % align
    return raw[offset:offset + n * itemsize].view(dtype)


def audit(arr: np.ndarray, name: str) -> bool:
    ok = is_aligned(arr)
    print(f"{name}: addr % {ALIGN} = {arr.ctypes.data % ALIGN} -> {'OK' if ok else 'MISALIGNED'}")
    return ok


if __name__ == "__main__":
    good = aligned_empty(1024)
    good[:] = 0.0
    audit(good, "aligned_empty")
    # Slicing one float64 off a 64-byte aligned buffer shifts it by 8 bytes.
    bad = good[1:]
    assert not is_aligned(bad)
    audit(bad, "offset view")
