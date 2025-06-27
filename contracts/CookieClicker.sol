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
    }

    // Mapping from player address to their game sessions
    mapping(address => GameSession[]) public playerSessions;
    
    // Mapping from player address to their best score
    mapping(address => uint256) public bestScores;
    
    // Array to track all players who have played
    address[] public allPlayers;
    
    // Mapping to check if a player has been added to allPlayers array
    mapping(address => bool) public isPlayerTracked;
    
    // Mapping from player address to their username
    mapping(address => string) public usernames;
    
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
    
    // Event emitted when a username is set or updated
    event UsernameSet(
        address indexed player,
        string username
    );

    /**
     * @dev Set or update the username for the caller's address
     * @param username The username to set
     */
    function setUsername(string calldata username) external {
        require(bytes(username).length > 0, "Username cannot be empty");
        usernames[msg.sender] = username;
        emit UsernameSet(msg.sender, username);
    }
    
    /**
     * @dev Get the username for a given address
     * @param player The player's address
     * @return The username of the player
     */
    function getUsername(address player) public view returns (string memory) {
        return usernames[player];
    }

    /**
     * @dev Record a game session with the number of cookies clicked
     * @param cookies The number of cookies clicked in this session
     * @param duration The duration of the game session in seconds
     */
    function recordGameSession(uint256 cookies, uint256 duration) external {
        require(cookies > 0, "Cookies must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        require(bytes(usernames[msg.sender]).length > 0, "Username must be set before recording a session");
        
        // Create new game session
        GameSession memory newSession = GameSession({
            cookies: cookies,
            timestamp: block.timestamp,
            duration: duration
        });
        
        // Add to player's sessions
        playerSessions[msg.sender].push(newSession);
        
        // Track new players
        if (!isPlayerTracked[msg.sender]) {
            allPlayers.push(msg.sender);
            isPlayerTracked[msg.sender] = true;
        }
        
        // Update total cookies clicked
        totalCookiesClicked += cookies;
        
        // Check if this is a new best score for the player
        uint256 previousBest = bestScores[msg.sender];
        if (cookies > previousBest) {
            bestScores[msg.sender] = cookies;
            emit NewBestScore(msg.sender, cookies, previousBest);
        }
        
        emit GameSessionRecorded(msg.sender, usernames[msg.sender], cookies, duration, block.timestamp);
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
        return (session.cookies, session.timestamp, session.duration, usernames[player]);
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
        return (bestSession.cookies, bestSession.timestamp, bestSession.duration, usernames[player]);
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
        return (session.cookies, session.timestamp, session.duration, usernames[player]);
    }
    
    /**
     * @dev Get the top 10 game sessions sorted by cookie count (highest first)
     * Uses a more efficient approach by only tracking best scores per player
     * @return players Array of player addresses
     * @return cookies Array of cookie counts
     * @return timestamps Array of session timestamps
     * @return durations Array of session durations
     * @return usernames Array of usernames
     */
    function getTop10GameSessions() 
        external 
        view 
        returns (
            address[10] memory players,
            uint256[10] memory cookies,
            uint256[10] memory timestamps,
            uint256[10] memory durations,
            string[10] memory usernames
        ) 
    {
        require(allPlayers.length > 0, "No players found");
        
        // Create temporary arrays for sorting
        uint256 playerCount = allPlayers.length;
        uint256[] memory bestScoresList = new uint256[](playerCount);
        uint256[] memory playerIndices = new uint256[](playerCount);
        
        // Get best scores for all players
        for (uint256 i = 0; i < playerCount; i++) {
            bestScoresList[i] = bestScores[allPlayers[i]];
            playerIndices[i] = i;
        }
        
        // Sort by best scores (descending) - simple bubble sort for small datasets
        for (uint256 i = 0; i < playerCount - 1; i++) {
            for (uint256 j = 0; j < playerCount - i - 1; j++) {
                if (bestScoresList[j] < bestScoresList[j + 1]) {
                    // Swap scores
                    uint256 tempScore = bestScoresList[j];
                    bestScoresList[j] = bestScoresList[j + 1];
                    bestScoresList[j + 1] = tempScore;
                    
                    // Swap player indices
                    uint256 tempIndex = playerIndices[j];
                    playerIndices[j] = playerIndices[j + 1];
                    playerIndices[j + 1] = tempIndex;
                }
            }
        }
        
        // Fill return arrays with top 10 players' best sessions
        uint256 returnCount = playerCount < 10 ? playerCount : 10;
        
        for (uint256 i = 0; i < returnCount; i++) {
            address player = allPlayers[playerIndices[i]];
            players[i] = player;
            
            // Find the best session for this player
            uint256 bestCookies = 0;
            uint256 bestSessionIndex = 0;
            
            for (uint256 j = 0; j < playerSessions[player].length; j++) {
                if (playerSessions[player][j].cookies > bestCookies) {
                    bestCookies = playerSessions[player][j].cookies;
                    bestSessionIndex = j;
                }
            }
            
            GameSession memory bestSession = playerSessions[player][bestSessionIndex];
            cookies[i] = bestSession.cookies;
            timestamps[i] = bestSession.timestamp;
            durations[i] = bestSession.duration;
            usernames[i] = CookieClicker.usernames[player];
        }
        
        return (players, cookies, timestamps, durations, usernames);
    }
    
    /**
     * @dev Get all game sessions for a user by their address
     * @param player The player's address
     * @return sessions Array of all GameSession structs for the player
     */
    function getPlayerSessionHistory(address player) 
        external 
        view 
        returns (GameSession[] memory sessions) 
    {
        return playerSessions[player];
    }
    
    /**
     * @dev Get the total number of players who have played
     * @return The total number of unique players
     */
    function getTotalPlayerCount() external view returns (uint256) {
        return allPlayers.length;
    }
}