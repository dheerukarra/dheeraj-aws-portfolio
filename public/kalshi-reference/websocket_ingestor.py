"""Async market-data ingestor with sequence-gap validation (reconstruction).

The feed here is a local fake generator. No network, no real credentials.
"""
from __future__ import annotations

import asyncio
import json
import os
from dataclasses import dataclass
from typing import AsyncIterator


@dataclass(frozen=True)
class Tick:
    seq: int
    ticker: str
    yes_price: float


class SequenceGap(Exception):
    def __init__(self, expected: int, got: int) -> None:
        super().__init__(f"gap: expected seq {expected}, got {got}")
        self.expected, self.got = expected, got


def parse_tick(raw: str) -> Tick:
    d = json.loads(raw)
    price = float(d["yes_price"])
    if not 0.0 <= price <= 1.0:
        raise ValueError(f"price out of bounds: {price}")
    return Tick(int(d["seq"]), str(d["ticker"]), price)


class SequenceValidator:
    def __init__(self) -> None:
        self.last: int | None = None

    def check(self, tick: Tick) -> None:
        expected = None if self.last is None else self.last + 1
        self.last = tick.seq
        if expected is not None and tick.seq != expected:
            raise SequenceGap(expected, tick.seq)


async def send_telegram(text: str) -> None:
    """Stub. Reads TELEGRAM_TOKEN from env; prints instead of sending."""
    token = os.environ.get("TELEGRAM_TOKEN")
    print(f"[telegram stub, token {'set' if token else 'unset'}] {text}")


async def fake_feed() -> AsyncIterator[str]:
    for seq in (1, 2, 3, 5, 6):  # 4 is dropped on purpose
        yield json.dumps({"seq": seq, "ticker": "DEMO-YES", "yes_price": 0.40 + seq / 100})
        await asyncio.sleep(0.01)


async def ingest(queue: "asyncio.Queue[Tick]") -> None:
    validator = SequenceValidator()
    async for raw in fake_feed():
        try:
            tick = parse_tick(raw)
            validator.check(tick)
        except SequenceGap as exc:
            await send_telegram(f"ALERT {exc}; resync required")
            continue
        except (ValueError, KeyError, json.JSONDecodeError) as exc:
            await send_telegram(f"ALERT bad message: {exc}")
            continue
        await queue.put(tick)


async def main() -> None:
    queue: "asyncio.Queue[Tick]" = asyncio.Queue()
    await ingest(queue)
    while not queue.empty():
        print(queue.get_nowait())


if __name__ == "__main__":
    asyncio.run(main())
