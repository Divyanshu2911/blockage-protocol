# blockage-protocol

A protocol design project for an L2 zk-rollup with off-chain membership and age-weighted exponential race lotteries.

## Overview

This repository contains the complete design, specification, simulation, and reference implementation skeletons for the `blockage-protocol`.

## Structure

- `/spec`: Formal protocol specification.
- `/design`: Design rationale, threat model, and incentives.
- `/sim`: Python simulation package for multi-epoch simulations.
- `/contracts`: Smart contract scaffolds (Solidity/Cairo).
- `/node`: TypeScript off-chain node skeleton.
- `/docs`: Documentation, one-pager, and ops runbook.
- `/tests`: Unit tests and fairness checks.

## Quickstart

### Prerequisites

- Python 3.8+
- Node.js 16+
- Docker (optional, for containerized runs)

### Simulation

```bash
cd sim
pip install -e .
blockage-sim run --epochs 100 --nodes 50
```

### Node

```bash
cd node
npm install
npm start
```

## License

MIT
