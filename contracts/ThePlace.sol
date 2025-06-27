// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ThePlace {
    struct CompanyPlacement {
        string companyUrl;
        string companyName;
        uint8 x;
        uint8 y;
        uint256 timestamp;
        bool exists;
    }

    // Grid size (7x7 = 49 spots)
    uint8 public constant GRID_SIZE = 7;
    
    // Mapping from address to their company placement
    mapping(address => CompanyPlacement) public userPlacements;
    
    // Mapping from position to address (to prevent conflicts)
    mapping(uint256 => address) public positionToUser;
    
    // Array to track all placements for easy retrieval
    address[] public allUsers;
    
    // Events
    event CompanyPlaced(
        address indexed user,
        string companyUrl,
        string companyName,
        uint8 x,
        uint8 y,
        uint256 timestamp
    );
    
    event CompanyUpdated(
        address indexed user,
        string oldUrl,
        string newUrl,
        string newCompanyName,
        uint8 newX,
        uint8 newY
    );

    // Helper function to convert x,y coordinates to single position ID
    function getPositionId(uint8 x, uint8 y) public pure returns (uint256) {
        require(x < GRID_SIZE && y < GRID_SIZE, "Position out of bounds");
        return uint256(y) * GRID_SIZE + uint256(x);
    }

    // Check if a position is available
    function isPositionAvailable(uint8 x, uint8 y) public view returns (bool) {
        uint256 positionId = getPositionId(x, y);
        return positionToUser[positionId] == address(0);
    }
    
    // Helper function to convert string to lowercase for comparison
    function _toLower(string memory str) private pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
    
    // Helper function to check if a string contains another string
    function _contains(string memory where, string memory what) private pure returns (bool) {
        bytes memory whereBytes = bytes(where);
        bytes memory whatBytes = bytes(what);
        
        if (whatBytes.length > whereBytes.length) return false;
        
        for (uint i = 0; i <= whereBytes.length - whatBytes.length; i++) {
            bool found = true;
            for (uint j = 0; j < whatBytes.length; j++) {
                if (whereBytes[i + j] != whatBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) return true;
        }
        return false;
    }
    
    // Check if content contains banned domains/keywords
    function _containsBannedContent(string memory url, string memory name) private pure returns (bool) {
        string memory lowerUrl = _toLower(url);
        string memory lowerName = _toLower(name);
        
        // Hardcoded list of banned domains and keywords
        string[50] memory bannedTerms = [
            "pornhub", "xvideos", "xnxx", "xhamster", "redtube",
            "youporn", "porn", "xxx", "sex", "nude",
            "onlyfans", "chaturbate", "livejasmin", "stripchat", "bongacams",
            "cam4", "myfreecams", "camsoda", "flirt4free", "streamate",
            "imlive", "adult", "nsfw", "18+", "milf",
            "teen", "amateur", "webcam", "cam", "fetish",
            "bdsm", "hentai", "rule34", "furry", "yiff",
            "e621", "nhentai", "hanime", "fakku", "dlsite",
            "dmm", "jav", "av", "gravure", "erotic",
            "lewd", "ecchi", "oppai", "ahegao", "doujin"
        ];
        
        // Additional illegal/harmful content keywords
        string[20] memory illegalTerms = [
            "drugs", "cocaine", "heroin", "meth", "weed",
            "marijuana", "cannabis", "darkweb", "darknet", "silkroad",
            "weapons", "guns", "explosives", "bomb", "terrorism",
            "hitman", "assassination", "murder", "illegal", "piracy"
        ];
        
        // Check banned terms
        for (uint i = 0; i < bannedTerms.length; i++) {
            if (bytes(bannedTerms[i]).length > 0) {
                if (_contains(lowerUrl, bannedTerms[i]) || _contains(lowerName, bannedTerms[i])) {
                    return true;
                }
            }
        }
        
        // Check illegal terms
        for (uint i = 0; i < illegalTerms.length; i++) {
            if (bytes(illegalTerms[i]).length > 0) {
                if (_contains(lowerUrl, illegalTerms[i]) || _contains(lowerName, illegalTerms[i])) {
                    return true;
                }
            }
        }
        
        return false;
    }

    // Place or update company logo
    function placeCompany(
        string memory companyUrl,
        string memory companyName,
        uint8 x,
        uint8 y
    ) external {
        require(bytes(companyUrl).length > 0, "Company URL cannot be empty");
        require(bytes(companyName).length > 0, "Company name cannot be empty");
        require(!_containsBannedContent(companyUrl, companyName), "Content contains inappropriate or illegal terms");
        
        uint256 newPositionId = getPositionId(x, y);
        
        // If user already has a placement, remove it from the old position
        if (userPlacements[msg.sender].exists) {
            uint256 oldPositionId = getPositionId(
                userPlacements[msg.sender].x,
                userPlacements[msg.sender].y
            );
            
            // Only clear old position if it's different from new position
            if (oldPositionId != newPositionId) {
                delete positionToUser[oldPositionId];
                
                emit CompanyUpdated(
                    msg.sender,
                    userPlacements[msg.sender].companyUrl,
                    companyUrl,
                    companyName,
                    x,
                    y
                );
            }
        } else {
            // First time placing, add to allUsers array
            allUsers.push(msg.sender);
        }

        // Check if new position is available (unless it's the user's current position)
        require(
            positionToUser[newPositionId] == address(0) || 
            positionToUser[newPositionId] == msg.sender,
            "Position already occupied"
        );

        // Update mappings
        positionToUser[newPositionId] = msg.sender;
        userPlacements[msg.sender] = CompanyPlacement({
            companyUrl: companyUrl,
            companyName: companyName,
            x: x,
            y: y,
            timestamp: block.timestamp,
            exists: true
        });

        emit CompanyPlaced(msg.sender, companyUrl, companyName, x, y, block.timestamp);
    }

    // Get user's placement
    function getUserPlacement(address user) external view returns (
        string memory companyUrl,
        string memory companyName,
        uint8 x,
        uint8 y,
        uint256 timestamp,
        bool exists
    ) {
        CompanyPlacement memory placement = userPlacements[user];
        return (
            placement.companyUrl,
            placement.companyName,
            placement.x,
            placement.y,
            placement.timestamp,
            placement.exists
        );
    }

    // Get placement at specific position
    function getPlacementAtPosition(uint8 x, uint8 y) external view returns (
        address user,
        string memory companyUrl,
        string memory companyName,
        uint256 timestamp
    ) {
        uint256 positionId = getPositionId(x, y);
        address userAtPosition = positionToUser[positionId];
        
        if (userAtPosition == address(0)) {
            return (address(0), "", "", 0);
        }

        CompanyPlacement memory placement = userPlacements[userAtPosition];
        return (userAtPosition, placement.companyUrl, placement.companyName, placement.timestamp);
    }

    // Get all placements (for displaying the full canvas)
    function getAllPlacements() external view returns (
        address[] memory users,
        string[] memory companyUrls,
        string[] memory companyNames,
        uint8[] memory xPositions,
        uint8[] memory yPositions,
        uint256[] memory timestamps
    ) {
        uint256 totalUsers = allUsers.length;
        
        users = new address[](totalUsers);
        companyUrls = new string[](totalUsers);
        companyNames = new string[](totalUsers);
        xPositions = new uint8[](totalUsers);
        yPositions = new uint8[](totalUsers);
        timestamps = new uint256[](totalUsers);

        for (uint256 i = 0; i < totalUsers; i++) {
            address user = allUsers[i];
            CompanyPlacement memory placement = userPlacements[user];
            
            if (placement.exists) {
                users[i] = user;
                companyUrls[i] = placement.companyUrl;
                companyNames[i] = placement.companyName;
                xPositions[i] = placement.x;
                yPositions[i] = placement.y;
                timestamps[i] = placement.timestamp;
            }
        }
    }

    // Get total number of placements
    function getTotalPlacements() external view returns (uint256) {
        return allUsers.length;
    }

    // Remove user's placement (optional feature)
    function removePlacement() external {
        require(userPlacements[msg.sender].exists, "No placement to remove");
        
        uint256 positionId = getPositionId(
            userPlacements[msg.sender].x,
            userPlacements[msg.sender].y
        );
        
        // Clear position mapping
        delete positionToUser[positionId];
        
        // Clear user placement
        delete userPlacements[msg.sender];
        
        // Remove from allUsers array (expensive operation, might want to optimize)
        for (uint256 i = 0; i < allUsers.length; i++) {
            if (allUsers[i] == msg.sender) {
                allUsers[i] = allUsers[allUsers.length - 1];
                allUsers.pop();
                break;
            }
        }
    }
}