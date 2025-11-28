import click
import json
import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from blockage.core import SimulationEngine

@click.group()
def main():
    pass

@main.command()
@click.option('--epochs', default=100, help='Number of epochs to run')
@click.option('--nodes', default=50, help='Number of nodes')
@click.option('--alpha', default=1.0, help='Stake weight exponent')
@click.option('--beta', default=0.3, help='Age weight exponent')
@click.option('--gamma', default=0.04, help='Age scaling factor')
@click.option('--amax', default=256, help='Max age cap')
@click.option('--out', default='results', help='Output directory')
def run(epochs, nodes, alpha, beta, gamma, amax, out):
    """Run a single simulation."""
    os.makedirs(out, exist_ok=True)
    
    engine = SimulationEngine(alpha, beta, gamma, amax)
    
    # Initialize nodes with random stakes (Pareto distribution to simulate wealth inequality)
    stakes = (np.random.pareto(a=2.0, size=nodes) + 1) * 100
    for i in range(nodes):
        engine.add_node(f"node_{i}", stakes[i])
        
    results = []
    wins = {f"node_{i}": 0 for i in range(nodes)}
    
    print(f"Running simulation for {epochs} epochs...")
    for e in range(epochs):
        seed = os.urandom(32)
        winner = engine.run_epoch(seed)
        if winner:
            wins[winner] += 1
        results.append({"epoch": e, "winner": winner})
        
    # Save results
    with open(f"{out}/summary.json", "w") as f:
        json.dump({"epochs": epochs, "nodes": nodes, "params": {"alpha": alpha, "beta": beta, "gamma": gamma, "amax": amax}}, f, indent=2)
        
    # CSV per node
    node_data = []
    for pid, node in engine.nodes.items():
        node_data.append({
            "pid": pid,
            "stake": node.stake,
            "wins": wins[pid],
            "win_rate": wins[pid] / epochs
        })
    df = pd.DataFrame(node_data)
    df.to_csv(f"{out}/per_node.csv", index=False)
    
    # Scorecard
    with open(f"{out}/scorecard.txt", "w") as f:
        f.write(f"Simulation Scorecard\n")
        f.write(f"====================\n")
        f.write(f"Total Epochs: {epochs}\n")
        f.write(f"Active Nodes: {nodes}\n")
        f.write(f"Gini Coefficient (Stake): {gini(df['stake'])}\n")
        f.write(f"Gini Coefficient (Wins): {gini(df['wins'])}\n")

    # Plots
    plot_fairness(df, out)
    print(f"Done. Results saved to {out}/")

def gini(x):
    total = 0
    for i, xi in enumerate(x[:-1], 1):
        total += np.sum(np.abs(xi - x[i:]))
    return total / (len(x)**2 * np.mean(x))

def plot_fairness(df, out):
    plt.figure(figsize=(10, 6))
    sns.scatterplot(data=df, x="stake", y="wins")
    plt.title("Fairness: Stake vs Wins")
    plt.xlabel("Stake")
    plt.ylabel("Wins")
    plt.savefig(f"{out}/fairness_scatter.png")
    plt.close()

if __name__ == "__main__":
    main()
