// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CookieClicker
 * @dev A simple contract to record cookie clicker game scores on-chain
 */
contract CookieClicker {
    struct GameSession {
        uint256 cookies;
        uint256 timestamp;
        uint256 duration; // in seconds
        string username;
    }

    // Mapping from player address to their game sessions
    mapping(address => GameSession[]) public playerSessions;
    
    // Mapping from player address to their best score
    mapping(address => uint256) public bestScores;
    
    // Total number of cookies clicked across all players
    uint256 public totalCookiesClicked;
    
    // Event emitted when a game session is recorded
    event GameSessionRecorded(
        address indexed player,
        string username,
        uint256 cookies,
        uint256 duration,
        uint256 timestamp
    );
    
    // Event emitted when a new best score is achieved
    event NewBestScore(
        address indexed player,
        uint256 newBestScore,
        uint256 previousBestScore
    );

    /**
     * @dev Record a game session with the number of cookies clicked
     * @param cookies The number of cookies clicked in this session
     * @param duration The duration of the game session in seconds
     * @param username The username of the player
     */
    function recordGameSession(uint256 cookies, uint256 duration, string calldata username) external {
        require(cookies > 0, "Cookies must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        require(bytes(username).length > 0, "Username cannot be empty");
        
        // Create new game session
        GameSession memory newSession = GameSession({
            cookies: cookies,
            timestamp: block.timestamp,
            duration: duration,
            username: username
        });
        
        // Add to player's sessions
        playerSessions[msg.sender].push(newSession);
        
        // Update total cookies clicked
        totalCookiesClicked += cookies;
        
        // Check if this is a new best score for the player
        uint256 previousBest = bestScores[msg.sender];
        if (cookies > previousBest) {
            bestScores[msg.sender] = cookies;
            emit NewBestScore(msg.sender, cookies, previousBest);
        }
        
        emit GameSessionRecorded(msg.sender, username, cookies, duration, block.timestamp);
    }
    
    /**
     * @dev Get the number of game sessions for a player
     * @param player The player's address
     * @return The number of sessions played
     */
    function getPlayerSessionCount(address player) external view returns (uint256) {
        return playerSessions[player].length;
    }
    
    /**
     * @dev Get a specific game session for a player
     * @param player The player's address
     * @param sessionIndex The index of the session
     * @return cookies The number of cookies in that session
     * @return timestamp The timestamp of the session
     * @return duration The duration of the session
     * @return username The username of the player
     */
    function getPlayerSession(address player, uint256 sessionIndex) 
        external 
        view 
        returns (uint256 cookies, uint256 timestamp, uint256 duration, string memory username) 
    {
        require(sessionIndex < playerSessions[player].length, "Session index out of bounds");
        
        GameSession memory session = playerSessions[player][sessionIndex];
        return (session.cookies, session.timestamp, session.duration, session.username);
    }
    
    /**
     * @dev Get the best session for a player (session with most cookies)
     * @param player The player's address
     * @return cookies The number of cookies in the best session
     * @return timestamp The timestamp of the best session
     * @return duration The duration of the best session
     * @return username The username of the player
     */
    function getPlayerBestScore(address player) 
        external 
        view 
        returns (uint256 cookies, uint256 timestamp, uint256 duration, string memory username) 
    {
        require(playerSessions[player].length > 0, "No sessions found for player");
        
        uint256 bestCookies = 0;
        uint256 bestSessionIndex = 0;
        
        // Find the session with the most cookies
        for (uint256 i = 0; i < playerSessions[player].length; i++) {
            if (playerSessions[player][i].cookies > bestCookies) {
                bestCookies = playerSessions[player][i].cookies;
                bestSessionIndex = i;
            }
        }
        
        GameSession memory bestSession = playerSessions[player][bestSessionIndex];
        return (bestSession.cookies, bestSession.timestamp, bestSession.duration, bestSession.username);
    }
    
    /**
     * @dev Get the total number of cookies clicked across all players
     * @return The total cookies clicked
     */
    function getTotalCookiesClicked() external view returns (uint256) {
        return totalCookiesClicked;
    }
    
    /**
     * @dev Get the latest game session for a player
     * @param player The player's address
     * @return cookies The number of cookies in the latest session
     * @return timestamp The timestamp of the latest session
     * @return duration The duration of the latest session
     * @return username The username of the player
     */
    function getLatestPlayerSession(address player) 
        external 
        view 
        returns (uint256 cookies, uint256 timestamp, uint256 duration, string memory username) 
    {
        require(playerSessions[player].length > 0, "No sessions found for player");
        
        uint256 latestIndex = playerSessions[player].length - 1;
        GameSession memory session = playerSessions[player][latestIndex];
        return (session.cookies, session.timestamp, session.duration, session.username);
    }
}