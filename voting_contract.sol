// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@opengsn/contracts/src/ERC2771Recipient.sol";

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);

    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

contract VotingSystem is ERC2771Recipient {
    address public admin;
    address public tokenAddress = 0x1C7312Cb60b40cF586e796FEdD60Cf243286c9E9; // ERC-20 token address

    uint256 public voteCost = 1e17; // 0.1 tokens

    struct Proposal {
        uint256 id;
        string title;
        string description;
        address author;
        uint256 upvotes;
        uint256 downvotes;
        bool isActive;
    }

    Proposal[] public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    uint256 public proposalCounter;

    event ProposalCreated(
        uint256 indexed id,
        string title,
        string description,
        address author
    );
    event VoteCasted(
        uint256 indexed proposalId,
        address indexed voter,
        bool isUpvote
    );

    constructor() {
        admin = _msgSender();
        _setTrustedForwarder(0xB2b5841DBeF766d4b521221732F9B618fCf34A87);
    }

    modifier onlyAdmin() {
        require(_msgSender() == admin, "Only admin can call this function");
        _;
    }

    function createProposal(
        string memory _title,
        string memory _description
    ) public {
        IERC20 token = IERC20(tokenAddress);
        require(
            token.transferFrom(_msgSender(), address(this), 1 ether),
            "Token transfer failed"
        ); // Transfer 1 whole token

        proposals.push(
            Proposal({
                id: proposalCounter,
                title: _title,
                description: _description,
                author: _msgSender(),
                upvotes: 0,
                downvotes: 0,
                isActive: true
            })
        );
        proposalCounter++;
        emit ProposalCreated(
            proposalCounter - 1,
            _title,
            _description,
            _msgSender()
        );
    }

    function vote(uint256 _proposalId, bool _isUpvote) public {
        require(_proposalId < proposalCounter, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.isActive, "Proposal is not active");
        require(!hasVoted[_proposalId][_msgSender()], "You have already voted");

        IERC20 token = IERC20(tokenAddress);
        require(
            token.transferFrom(_msgSender(), address(this), voteCost),
            "Token transfer failed"
        );

        if (_isUpvote) {
            proposal.upvotes++;
        } else {
            proposal.downvotes++;
        }
        hasVoted[_proposalId][_msgSender()] = true;
        emit VoteCasted(_proposalId, _msgSender(), _isUpvote);
    }

    function getProposalCount() public view returns (uint256) {
        return proposalCounter;
    }

    function getProposalDetails(
        uint256 _proposalId
    )
        public
        view
        returns (string memory, string memory, uint256, uint256, bool)
    {
        require(_proposalId < proposalCounter, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.title,
            proposal.description,
            proposal.upvotes,
            proposal.downvotes,
            proposal.isActive
        );
    }

    function deactivateProposal(uint256 _proposalId) public onlyAdmin {
        require(_proposalId < proposalCounter, "Invalid proposal ID");
        Proposal storage proposal = proposals[_proposalId];
        proposal.isActive = false;
    }

    function getAllProposalTitlesAndIds()
        public
        view
        returns (string[] memory, uint256[] memory)
    {
        uint256 count = proposalCounter > 10 ? 10 : proposalCounter;
        string[] memory titles = new string[](count);
        uint256[] memory ids = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            titles[i] = proposals[proposalCounter - i - 1].title;
            ids[i] = proposals[proposalCounter - i - 1].id;
        }

        return (titles, ids);
    }
}
