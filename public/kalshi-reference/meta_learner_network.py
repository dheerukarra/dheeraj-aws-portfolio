"""Four specialist agents plus a gating meta-learner (reconstruction)."""
from __future__ import annotations

import torch
from torch import nn

AGENTS = ("arbitrage", "momentum", "orderflow", "tail_risk")


class Specialist(nn.Module):
    """Small MLP mapping features to a signal in [-1, 1]."""

    def __init__(self, n_features: int, hidden: int = 32) -> None:
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(n_features, hidden),
            nn.ReLU(),
            nn.Linear(hidden, 1),
            nn.Tanh(),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class MetaLearner(nn.Module):
    """Softmax gate over specialist outputs.

    Specialist outputs are detached before the gate sees them, so the gate
    loss never updates specialist weights (gradient isolation).
    """

    def __init__(self, n_features: int, n_agents: int = len(AGENTS)) -> None:
        super().__init__()
        self.specialists = nn.ModuleList(Specialist(n_features) for _ in range(n_agents))
        self.gate = nn.Sequential(
            nn.Linear(n_features + n_agents, 32),
            nn.ReLU(),
            nn.Linear(32, n_agents),
        )

    def forward(self, x: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        signals = torch.cat([s(x) for s in self.specialists], dim=-1)  # (B, A)
        frozen = signals.detach()
        weights = torch.softmax(self.gate(torch.cat([x, frozen], dim=-1)), dim=-1)
        blended = (weights * frozen).sum(dim=-1, keepdim=True)
        return blended, weights, signals


def train_step(model: MetaLearner, x: torch.Tensor, y: torch.Tensor,
               opt_gate: torch.optim.Optimizer, opt_spec: torch.optim.Optimizer) -> float:
    """Gate trains on blended error; each specialist trains on its own error."""
    blended, _, signals = model(x)
    gate_loss = nn.functional.mse_loss(blended, y)
    spec_loss = nn.functional.mse_loss(signals, y.expand_as(signals))
    opt_gate.zero_grad()
    opt_spec.zero_grad()
    (gate_loss + spec_loss).backward()
    opt_gate.step()
    opt_spec.step()
    return float(gate_loss)


if __name__ == "__main__":
    torch.manual_seed(0)
    model = MetaLearner(n_features=8)
    opt_gate = torch.optim.Adam(model.gate.parameters(), lr=1e-3)
    opt_spec = torch.optim.Adam(model.specialists.parameters(), lr=1e-3)
    x, y = torch.randn(64, 8), torch.randn(64, 1).tanh()
    for step in range(3):
        print(step, train_step(model, x, y, opt_gate, opt_spec))
    _, w, _ = model(x)
    print(dict(zip(AGENTS, w.mean(0).tolist())))
