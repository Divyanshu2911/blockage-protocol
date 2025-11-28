import numpy as np
import hashlib
from dataclasses import dataclass
from enum import Enum
from typing import List, Dict, Optional

class NodeState(Enum):
    PENDING = "Pending"
    ACTIVE = "Active"
    UNBONDING = "Unbonding"
    EXITED = "Exited"

@dataclass
class Node:
    pid: str
    stake: float
    age: int = 0
    state: NodeState = NodeState.ACTIVE
    vrf_key: bytes = b""

class SimulationEngine:
    def __init__(self, alpha: float, beta: float, gamma: float, a_max: int):
        self.alpha = alpha
        self.beta = beta
        self.gamma = gamma
        self.a_max = a_max
        self.nodes: Dict[str, Node] = {}
        self.current_epoch = 0

    def add_node(self, pid: str, stake: float):
        self.nodes[pid] = Node(pid=pid, stake=stake, vrf_key=pid.encode())

    def calculate_weight(self, node: Node) -> float:
        if node.state != NodeState.ACTIVE:
            return 0.0
        
        age_factor = (1 + self.gamma * min(node.age, self.a_max)) ** self.beta
        stake_factor = node.stake ** self.alpha
        return stake_factor * age_factor

    def run_epoch(self, seed: bytes) -> str:
        """
        Run a lottery for the current epoch.
        Returns the PID of the winner.
        """
        weights = {}
        total_weight = 0.0
        
        candidates = [n for n in self.nodes.values() if n.state == NodeState.ACTIVE]
        if not candidates:
            return None

        # Calculate weights
        for node in candidates:
            w = self.calculate_weight(node)
            weights[node.pid] = w
            total_weight += w

        # Selection (Weighted Random)
        # In a real protocol, this is done via VRF thresholds.
        # Here we simulate the probability distribution.
        
        pids = list(weights.keys())
        probs = [weights[pid] / total_weight for pid in pids]
        
        winner_pid = np.random.choice(pids, p=probs)
        
        # Update ages
        for node in candidates:
            if node.pid == winner_pid:
                node.age = 0 # Reset age on win
            else:
                node.age += 1 # Increment age
        
        self.current_epoch += 1
        return winner_pid

    def get_stats(self):
        return {
            "epoch": self.current_epoch,
            "active_nodes": len([n for n in self.nodes.values() if n.state == NodeState.ACTIVE]),
        }
