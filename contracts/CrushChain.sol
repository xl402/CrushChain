pragma solidity ^0.5.0;

contract CrushChain {

  address owner;

  uint constant public crush = 1 ether;

  struct Post {
    uint id; // Reference posts with their IDs
    string content;
    uint256 timestamp;
    uint award; //
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
  mapping(address => uint[]) private wallet2post_ids;

  // Awards pool contains a dictionary of a list, each post with an award
  // maps its id to an IOU list which contains the awarder address and the award
  mapping (uint => IOU[]) public crushes_pool;

  // Public ledger that stores which address can see posts' identities
  mapping (address => uint[]) public whoCanSeeWhom;

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
    wallet2post_ids[msg.sender].push(postsCount);
    postsCount ++;
    emit PostAdded(postsCount, _content);
  }

  function myPosts () public view returns (uint[] memory) {
    return wallet2post_ids[msg.sender];
  }

  function crushBalance() public view returns (uint) {
    return address(this).balance;
  }

  function awardPost (uint _id) public payable {
    // Need to specify post id
    require(msg.value >= crush);
    Post storage mypost = posts[_id];
    require(mypost.claimed == false);
    crushes_pool[_id].push(IOU(msg.sender, msg.value));
    mypost.award = mypost.award + msg.value;
    // Verify in truffle console: app = await CrushChain.deployed()
  }

  function claimPost (uint _id) public returns (uint) {
    // First check whether the post belongs to the claimer
    require(msg.sender == post2wallet[_id]);

    // Second check whether their are any awards on the post
    IOU[] storage myIOU_lst = crushes_pool[_id];
    require(myIOU_lst.length >= 0);

    uint rewardAmount;
    for (uint i=0; i<myIOU_lst.length; i++) {
      IOU storage myIOU = myIOU_lst[i];
      rewardAmount = rewardAmount + myIOU.award;
      // Add the sender id to the list of posts'identities which the sender can see
      whoCanSeeWhom[myIOU.sender].push(_id);
    }
    // Transfer fund to owner
    msg.sender.transfer(rewardAmount);

    // Set the post to be claimed and clear the amount awarded
    Post storage mypost = posts[_id];
    mypost.claimed = true;
    mypost.award = 0;

    return rewardAmount;
  }

  function idsIcanSee() public view returns(uint [] memory) {
    return whoCanSeeWhom[msg.sender];
  }

  function addsIcanSee() public view returns(address[] memory) {
    // Get a list of ids which the current wallet has the privilege to see
    uint[] memory viewable_ids = whoCanSeeWhom[msg.sender];

    // Initialize address array which has the same length as viewable ids
    address[] memory addresses = new address[](viewable_ids.length);
    for (uint i=0; i<viewable_ids.length; i++) {
      // Convert the post id to the owner's wallet address
      uint id = viewable_ids[i];
      address owner_add = post2wallet[id];
      addresses[i] = owner_add;
    }
    return addresses;
  }
}
