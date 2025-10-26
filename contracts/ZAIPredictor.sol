// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";

contract ZAIPredictor is GatewayCaller {
    using TFHE for euint32;
    using TFHE for euint64;
    using TFHE for ebool;

    struct EncryptedPrediction {
        euint32 result;
        euint32 confidence;
        euint32 timestamp;
        string domain;
        bool exists;
    }

    struct FederatedPool {
        euint64 aggregatedValue;
        euint32 participantCount;
        euint32 lastUpdate;
        mapping(address => bool) participants;
    }

    mapping(address => EncryptedPrediction) public userPredictions;
    mapping(string => FederatedPool) public federatedPools;
    
    address public owner;
    bool public contractActive;

    event PredictionSubmitted(address indexed user, string domain, uint256 timestamp);
    event FederatedUpdate(string indexed domain, uint256 participantCount);
    event DecryptionRequested(address indexed user, uint256 requestId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyActive() {
        require(contractActive, "Contract not active");
        _;
    }

    constructor() {
        owner = msg.sender;
        contractActive = true;
    }

    function submitEncrypted(
        einput encryptedInput1,
        einput encryptedInput2,
        einput encryptedInput3,
        bytes calldata inputProof,
        string calldata domain
    ) external onlyActive {
        euint32 input1 = TFHE.asEuint32(encryptedInput1, inputProof);
        euint32 input2 = TFHE.asEuint32(encryptedInput2, inputProof);
        euint32 input3 = TFHE.asEuint32(encryptedInput3, inputProof);

        euint32 prediction = _computeEncryptedPrediction(input1, input2, input3, domain);
        euint32 confidence = _computeConfidence(input1, input2, input3);
        euint32 currentTime = TFHE.asEuint32(uint32(block.timestamp));

        userPredictions[msg.sender] = EncryptedPrediction({
            result: prediction,
            confidence: confidence,
            timestamp: currentTime,
            domain: domain,
            exists: true
        });

        _updateFederatedPool(domain, TFHE.asEuint64(prediction));
        emit PredictionSubmitted(msg.sender, domain, block.timestamp);
    }

    function _computeEncryptedPrediction(
        euint32 input1,
        euint32 input2,
        euint32 input3,
        string memory domain
    ) internal pure returns (euint32) {
        euint32 weight1 = TFHE.asEuint32(40);
        euint32 weight2 = TFHE.asEuint32(35);
        euint32 weight3 = TFHE.asEuint32(25);

        euint32 weighted1 = TFHE.mul(input1, weight1);
        euint32 weighted2 = TFHE.mul(input2, weight2);
        euint32 weighted3 = TFHE.mul(input3, weight3);

        return TFHE.add(weighted1, TFHE.add(weighted2, weighted3));
    }

    function _computeConfidence(
        euint32 input1,
        euint32 input2,
        euint32 input3
    ) internal pure returns (euint32) {
        euint32 diff1 = TFHE.sub(input1, input2);
        euint32 diff2 = TFHE.sub(input2, input3);
        euint32 variance = TFHE.add(diff1, diff2);
        
        euint32 baseConfidence = TFHE.asEuint32(85);
        return TFHE.sub(baseConfidence, TFHE.mul(variance, TFHE.asEuint32(1)));
    }

    function _updateFederatedPool(string memory domain, euint64 value) internal {
        FederatedPool storage pool = federatedPools[domain];
        
        if (!pool.participants[msg.sender]) {
            pool.aggregatedValue = TFHE.add(pool.aggregatedValue, value);
            pool.participantCount = TFHE.add(pool.participantCount, TFHE.asEuint32(1));
            pool.participants[msg.sender] = true;
            pool.lastUpdate = TFHE.asEuint32(uint32(block.timestamp));
            
            emit FederatedUpdate(domain, 1);
        }
    }

    function getEncryptedPrediction(address user) external view returns (EncryptedPrediction memory) {
        require(userPredictions[user].exists, "No prediction found");
        return userPredictions[user];
    }

    function requestDecryption() external {
        require(userPredictions[msg.sender].exists, "No prediction to decrypt");
        
        EncryptedPrediction storage prediction = userPredictions[msg.sender];
        
        uint256[] memory cts = new uint256[](3);
        cts[0] = Gateway.toUint256(prediction.result);
        cts[1] = Gateway.toUint256(prediction.confidence);
        cts[2] = Gateway.toUint256(prediction.timestamp);
        
        uint256 requestId = Gateway.requestDecryption(
            cts,
            this.callbackDecryption.selector,
            0,
            block.timestamp + 100,
            false
        );
        
        decryptionRequests[requestId] = msg.sender;
        emit DecryptionRequested(msg.sender, requestId);
    }
    
    function getDecryptedResults(address user) external view returns (uint256[] memory) {
        return userDecryptedResults[user];
    }
    
    function hasDecryptedResults(address user) external view returns (bool) {
        return userDecryptedResults[user].length > 0;
    }

    mapping(uint256 => address) public decryptionRequests;
    mapping(address => uint256[]) public userDecryptedResults;
    
    function callbackDecryption(
        uint256 requestId,
        bool success,
        uint256[] memory decryptedValues
    ) public onlyGateway {
        require(success, "Decryption failed");
        
        address user = decryptionRequests[requestId];
        require(user != address(0), "Invalid request");
        
        userDecryptedResults[user] = decryptedValues;
        delete decryptionRequests[requestId];
        
        emit DecryptionCompleted(user, requestId, decryptedValues[0], decryptedValues[1]);
    }
    
    event DecryptionCompleted(address indexed user, uint256 requestId, uint256 prediction, uint256 confidence);

    function federatedAggregate(string calldata domain) external view returns (euint64, euint32) {
        FederatedPool storage pool = federatedPools[domain];
        return (pool.aggregatedValue, pool.participantCount);
    }
    
    function getPoolAverage(string calldata domain) external view returns (euint64) {
        FederatedPool storage pool = federatedPools[domain];
        ebool hasParticipants = TFHE.gt(pool.participantCount, TFHE.asEuint32(0));
        
        euint64 average = TFHE.div(pool.aggregatedValue, TFHE.asEuint64(pool.participantCount));
        return TFHE.select(hasParticipants, average, TFHE.asEuint64(0));
    }
    
    function emergencyPause() external onlyOwner {
        contractActive = false;
    }
    
    function unpause() external onlyOwner {
        contractActive = true;
    }
}