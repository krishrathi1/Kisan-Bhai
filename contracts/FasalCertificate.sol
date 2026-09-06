// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FasalCertificate
 * @notice Minimal on-chain registry for crop certificate verification.
 *         Stores ONLY the certificate ID, data hash, and timestamp.
 *         No sensitive farmer information is stored on-chain.
 */
contract FasalCertificate {
    struct Certificate {
        bytes32 dataHash;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Certificate) private certificates;

    event CertificateRecorded(
        string indexed certificateId,
        bytes32 dataHash,
        uint256 timestamp
    );

    /**
     * @notice Record a new crop certificate on-chain.
     * @param certificateId Unique certificate identifier (e.g. "BM-WHT-2026-001")
     * @param dataHash SHA-256 hash of the crop data (stored as bytes32)
     */
    function recordCertificate(
        string calldata certificateId,
        bytes32 dataHash
    ) external {
        require(!certificates[certificateId].exists, "Certificate already exists");
        require(dataHash != bytes32(0), "Invalid data hash");

        certificates[certificateId] = Certificate({
            dataHash: dataHash,
            timestamp: block.timestamp,
            exists: true
        });

        emit CertificateRecorded(certificateId, dataHash, block.timestamp);
    }

    /**
     * @notice Verify a certificate exists and return its data.
     * @param certificateId The certificate ID to look up
     * @return dataHash The stored SHA-256 hash
     * @return timestamp When the certificate was recorded
     * @return exists Whether the certificate exists
     */
    function verifyCertificate(
        string calldata certificateId
    ) external view returns (bytes32 dataHash, uint256 timestamp, bool exists) {
        Certificate storage cert = certificates[certificateId];
        return (cert.dataHash, cert.timestamp, cert.exists);
    }
}
