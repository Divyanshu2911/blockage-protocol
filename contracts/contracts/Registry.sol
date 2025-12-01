// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Registry {
    enum State { Pending, Active, Unbonding, Exited }

    struct Node {
        uint256 stake;
        uint256 age;
        State state;
        bytes32 vrfKey;
        uint256 unbondTime;
        uint8 role; // 1=Sequencer, 2=Prover, 3=Both
    }

    mapping(address => Node) public nodes;
    uint256 public constant UNBONDING_PERIOD = 7 days;

    event Registered(address indexed node, uint256 stake, uint8 role);
    event Activated(address indexed node);
    event UnbondingStarted(address indexed node, uint256 releaseTime);
    event Exited(address indexed node);

    function register(bytes32 _vrfKey, uint8 _role) external payable {
        require(nodes[msg.sender].state == State.Exited || nodes[msg.sender].stake == 0, "Already registered");
        require(msg.value > 0, "Stake required");
        require(_role > 0 && _role <= 3, "Invalid role");

        nodes[msg.sender] = Node({
            stake: msg.value,
            age: 0,
            state: State.Pending,
            vrfKey: _vrfKey,
            unbondTime: 0,
            role: _role
        });

        emit Registered(msg.sender, msg.value, _role);
    }

    function activate() external {
        require(nodes[msg.sender].state == State.Pending, "Not pending");
        // In a real implementation, this might wait for the next epoch
        nodes[msg.sender].state = State.Active;
        emit Activated(msg.sender);
    }

    function unbond() external {
        require(nodes[msg.sender].state == State.Active, "Not active");
        nodes[msg.sender].state = State.Unbonding;
        nodes[msg.sender].unbondTime = block.timestamp + UNBONDING_PERIOD;
        emit UnbondingStarted(msg.sender, nodes[msg.sender].unbondTime);
    }

    function withdraw() external {
        require(nodes[msg.sender].state == State.Unbonding, "Not unbonding");
        require(block.timestamp >= nodes[msg.sender].unbondTime, "Still locked");

        uint256 amount = nodes[msg.sender].stake;
        nodes[msg.sender].stake = 0;
        nodes[msg.sender].state = State.Exited;

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Transfer failed");

        emit Exited(msg.sender);
    }

    function isActive(address node) external view returns (bool) {
        return nodes[node].state == State.Active;
    }

    function getStake(address node) external view returns (uint256) {
        return nodes[node].stake;
    }

    function getRole(address node) external view returns (uint8) {
        return nodes[node].role;
    }
}
