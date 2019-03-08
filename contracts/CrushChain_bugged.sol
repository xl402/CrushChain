pragma solidity ^0.5.0;

contract CrushChain {

  uint constant crushes = 2 finney; // around 25p per reward base

  struct Post {
    uint id; // Reference posts with their IDs
    string content;
    address owner; // Wallet address for the owner
    uint256 timestamp;
    uint award; // 1 award = 1 microeth
    bool claimed; // Whether the owner has claimed the post
    uint flags; // Number of spam/inappropriate reports on post
    uint likes;
  }

  struct IOU {
    address sender;
    uint award;
  }

  // Posts are a collection of post mapped from their id to content
  uint public postsCount;
  mapping(uint => Post) public posts;

  // Awards pool contains a dictionary of a list, each post with an award
  // maps its id to an IOU list which contains the awarder address and the award
  mapping (uint => IOU[]) public crushes_pool;

  constructor() public {
    addPost("Welcome to CrushChain!");
    addPost("To Jigglypuff: you complete my parity check x");
  }

  function addPost (string memory _content) public {
    posts[postsCount] = Post(postsCount, _content, msg.sender,now, 0, false, 0, 0);
    postsCount ++;
  }

  function awardPost (uint _id, uint _award) public {
    // Need to specify post id and award amount
    crushes_pool[_id].push(IOU(msg.sender, _award));
    // Verify in truffle console: app = await CrushChain.deployed()
    // add = await app.awardPost(0, 15) then crushlist = await app.crushes_pool(0,0)
  }
}
