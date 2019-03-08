pragma solidity ^0.5.0;

contract CrushChain {

  uint constant crushes = 2 finney; // around 25p per reward base

  struct Post {
    uint id; // Reference posts with their IDs
    string content;
    uint256 timestamp;
    uint award; // 1 award = 1 microeth
    bool claimed; // Whether the owner has claimed the post
    uint flags; // Number of spam/inappropriate reports on post
  }

  struct IOU {
    address sender;
    uint award;
  }

  // Posts are a collection of post mapped from their id to content
  uint public postsCount;
  mapping(uint => Post) public posts;

  // Securely store which address belong to which post
  mapping(uint => address) private post2wallet;

  // Awards pool contains a dictionary of a list, each post with an award
  // maps its id to an IOU list which contains the awarder address and the award
  mapping (uint => IOU[]) public crushes_pool;

  constructor() public {
    addPost("Welcome to CrushChain! Make immutable posts to your crush and be awarded by the community!");
    addPost("Reward posts which you want to find out owners identity, the owner can then claim the reward and REVEAL him/herself!");
    addPost("Our site deploys Machine Learning models to filter out spams! Help its performance by flagging fake crush posts.");
  }

  event PostAdded(
    uint id,
    string content
  );

  function addPost (string memory _content) public {
    posts[postsCount] = Post(postsCount, _content , now, 0, false, 0);
    post2wallet[postsCount] = msg.sender;
    postsCount ++;
    emit PostAdded(postsCount, _content);
  }

  function awardPost (uint _id, uint _award) public {
    // Need to specify post id and award amount
    crushes_pool[_id].push(IOU(msg.sender, _award));
    // Verify in truffle console: app = await CrushChain.deployed()
    // add = await app.awardPost(0, 15) then crushlist = await app.crushes_pool(0,0)
  }
}
