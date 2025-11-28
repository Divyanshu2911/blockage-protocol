import pytest
import numpy as np
from blockage.core import SimulationEngine, NodeState

def test_weight_calculation():
    engine = SimulationEngine(alpha=1.0, beta=1.0, gamma=1.0, a_max=10)
    engine.add_node("test", 100)
    node = engine.nodes["test"]
    
    # Age 0
    w0 = engine.calculate_weight(node)
    assert w0 == 100 * (1 + 1.0 * 0) ** 1.0 # 100
    
    # Age 1
    node.age = 1
    w1 = engine.calculate_weight(node)
    assert w1 == 100 * (1 + 1.0 * 1) ** 1.0 # 200

def test_fairness_distribution():
    engine = SimulationEngine(alpha=1.0, beta=0.0, gamma=0.0, a_max=10) # Pure stake weight
    engine.add_node("rich", 900)
    engine.add_node("poor", 100)
    
    wins = {"rich": 0, "poor": 0}
    epochs = 1000
    
    for _ in range(epochs):
        winner = engine.run_epoch(b"")
        wins[winner] += 1
        
    # Rich should win approx 90%
    assert 0.85 < wins["rich"] / epochs < 0.95
