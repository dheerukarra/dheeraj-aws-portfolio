# Kalshi HFT reference (reconstruction)

The original source files for this project were lost. Everything in this folder
is a **reconstruction** of the architecture, written from the project
description. It is illustrative, is not the deployed code, and has no
measured results attached. No tokens, keys or credentials are included.

## Architecture

1. Layer 1, Arbitrage: spots mispriced YES/NO pairs.
2. Layer 2, Momentum: follows short-horizon price drift.
3. Layer 3, RL execution policy: decides size and timing.

Four specialist agents (arbitrage, momentum, orderflow imbalance, tail-risk
guard) feed a gating meta-learner. The gate sees detached specialist outputs,
so its loss cannot push gradients into the specialists. This is the guard
against catastrophic interference.

## Files

- `meta_learner_network.py`: specialists plus gate (PyTorch).
- `websocket_ingestor.py`: asyncio ingest, sequence-gap checks, Telegram stub.
- `memory_alignment_audit.py`: checks a NumPy buffer is 64-byte aligned.

## Run

```
pip install torch numpy
python meta_learner_network.py
python memory_alignment_audit.py
python websocket_ingestor.py
```

Any latency or performance figure in the browser simulator is simulated.
