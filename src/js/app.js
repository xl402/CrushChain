// Store all the javascript code
const list = document.querySelector('.tweetEntry-tweetHolder');
const myPost = document.querySelector('.formHolder');
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const crush = 1000000000000000000;

App = {
  loading: false,
  contracts: {},
  sortByRecent: false,
  load: async () => {
    // Load app
    console.log("app loading...")
    await App.loadWeb3() //create a await that talks to the blockchain
    await App.loadAccount() //display the eth account address
    await App.loadContract()
    await App.renderPosts()
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    // CONNECT TO BLOCKCHAIN
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      App.web3Provider = new web3.providers.HttpProvider('http://127.0.0.1:7545');
      web3 = new Web3(App.web3Provider);
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async() => {
    // Retreive the account
    App.account = web3.eth.accounts[0]
    let welcomeItem = document.getElementById("welcome-message");
    let welcomeString='Welcome, '+App.account+'!';
    welcomeItem.textContent=(welcomeString);
  },

  loadContract: async() => {
    // Load the contract, first create a JavaScript version of the smart contract
    const crushChain = await $.getJSON('CrushChain.json')
    App.contracts.CrushChain = TruffleContract(crushChain)
    App.contracts.CrushChain.setProvider(App.web3Provider)
    // Hydrate the smart contract with values from the blockchain
    App.CrushChain = await App.contracts.CrushChain.deployed() // just like our console
  },

  createPost: async() => {
    const content = document.querySelector(".form-group textarea");
    const post_message = content.value;
    // Get post message
    if (post_message != "") {
      await App.CrushChain.addPost(post_message)
      window.location.reload()
    }
  },

  addReward: async(value, button) => {
    const postId=button.getAttribute("data-id");
    const award = await App.CrushChain.awardPost(postId, {
      from: App.account,
      value: crush*value,
      gas: 500000
    });
    location.reload();
  },

  claimReward: async(button) => {
    const postId = button.getAttribute("data-id");
    console.log(postId);
    const claimPost = await App.CrushChain.claimPost(Number(postId));
    location.reload();
  },

  changeSort: async() => {
    document.getElementById("no-posts").style.display="none";
    App.sortByRecent = !App.sortByRecent;
    const container = document.getElementById("post-container");
    const posts = document.getElementsByClassName("tweetEntry");

    const length = posts.length;
    const sortMe = [];
    for (i=0; i<length; i++) {
      posts[i].style.display = "block";
      const order = posts[i].getAttribute("data-order");
      // convert this to a number
      const award = Number(posts[i].getAttribute("data-award"))/crush;
      sortMe.push(App.sortByRecent ? [award, posts[i]]:[order, posts[i]]);
    }
    sortMe.sort(function(x, y) {
      return x[0] - y[0];
    });
    for (var i=sortMe.length-1; i >= 0; i--) {
       container.appendChild(sortMe[i][1]);
    }
    document.getElementById("sortButton").textContent = App.sortByRecent ? 'Most Rewarded Posts' : 'Most Recent Posts';
  },

  showMyPosts: async() => {
    const wallet2post_ids = await App.CrushChain.myPosts()
    const postIds=wallet2post_ids.map(id => id.toNumber());
    const posts = document.getElementsByClassName("tweetEntry");
    const length = posts.length;
    let postCount = 0;
    for (i=0; i<length; i++) {
     const postId = posts[i].getAttribute("data-id");
     if (!postIds.includes(Number(postId))) {
     posts[i].style.display = "none";
     postCount++;
    }
  }
  // If all posts not owned by user, display no posts message
  if (postCount == length) {
    document.getElementById("no-posts").style.display="inline-block";
  }
  },


  renderPosts: async() => {
    const wallet2post_ids = await App.CrushChain.myPosts()
    const postIds=wallet2post_ids.map(id => id.toNumber());
    const idsIcanSee = await App.CrushChain.idsIcanSee();
    const addsIcanSee = await App.CrushChain.addsIcanSee();


      const postCount = await App.CrushChain.postsCount()
    for (var i = postCount-1; i >= 0; i--) {
      const post = await App.CrushChain.posts(i)
      const postId = post[0].toNumber()
      const content = post[1]
      const timestamp = post[2].toNumber()
      const award = post[3]
      const claimed = post[4]
      const flags = post[5]

      var temp = document.getElementById("post-template");
      postbox = temp.content.cloneNode(true);


      // Hide action list for own/first 3/claimed posts, show claim button for own posts;
      item = postbox.querySelector(".tweetEntry-action-list");
      item.style.display = postIds.includes(postId) || postId<3  || claimed ? "none" : "block";
      item = postbox.querySelector(".claim");
      item.style.display = postIds.includes(postId) ? (award > 0) ? "block" : "none" : "none";

      // Assign post ID for adding/claiming rewards
      item = postbox.querySelector(".need-id1");
      item.setAttribute("data-id", postId);
      item = postbox.querySelector(".need-id2");
      item.setAttribute("data-id", postId);
      item = postbox.querySelector(".need-id3");
      item.setAttribute("data-id", postId);
      item = postbox.querySelector(".claim");
      item.setAttribute("data-id", postId);
      item = postbox.querySelector(".tweetEntry");
      item.setAttribute("data-id", postId);

      // Fill in text of post
      item = postbox.querySelector(".tweetEntry-text-container");
      item.textContent = content;

      // Assign chronological order
      item = postbox.querySelector(".tweetEntry");
      item.setAttribute("data-order", i);

      // Assign award amount
      item = postbox.querySelector(".tweetEntry");
      item.setAttribute("data-award", award.toNumber());
      item = postbox.querySelector(".converted-value");
      item.setAttribute("data-award", award.toNumber());

      // Also fill its timestamp
      item = postbox.querySelector(".tweetEntry-timestamp");
      item.textContent = timestampToString(timestamp);

      // Display current reward amount
      item = postbox.querySelector(".tweetEntry-reward");
      item.textContent = claimed ? ' Reward claimed' : ' Current reward: '+award/crush+" ETH";
      // Show addresses of reward-claimed posts
      const numberIds = idsIcanSee.map(id => id.toNumber());
      const index = numberIds.indexOf(postId);
      item.textContent += index >= 0 ? ' by '+addsIcanSee[index] : ""


      // Hide conversion for claimed posts
      // Display current reward amount
      item = postbox.querySelector(".converted-value");
      item.style.display = claimed ? 'none' : 'auto';

      // Fill avatar with some random cat image for lols
      item = postbox.getElementById("catImg");
      num = (Math.floor(Math.random()*10) + 10 ) * 5;
      item.src = "http://placekitten.com/" + num + "/" + num;

      list.appendChild(postbox);
    }
    convertToBitcoin();
    convertToEuro();
  },

}

$(() => {
  $(window).load(() => {
    App.load()
  })
})

function timestampToString(timestamp) {
  // Convert timestamp to human readable format
  var d = new Date(timestamp);
  const time = d.getDate() + ' ' + monthNames[d.getMonth()]
               + ' at ' + (d.getHours()<10?'0':'') + d.getHours() + ':' +
               (d.getMinutes()<10?'0':'') + d.getMinutes();
  return time;
}

function convertToBitcoin() {
  const gimmeData = new XMLHttpRequest();
  gimmeData.open('GET', "https://cors-anywhere.herokuapp.com/https://api.mybitx.com/api/1/ticker?pair=ETHXBT", true);
  gimmeData.send();
  gimmeData.addEventListener("readystatechange", processRequest, false);
  function processRequest(e) {
    if (gimmeData.readyState == 4 && gimmeData.status == 200) {
      const response = JSON.parse(gimmeData.responseText);
      const XBTtoEUR = response.ask;
      const posts = document.getElementsByClassName("converted-value");
      const length = posts.length;
      for (i=0; i<length; i++) {
        const reward = posts[i].getAttribute("data-award");
        const convertedReward=reward*XBTtoEUR/crush;
        posts[i].setAttribute("data-award", convertedReward);
      }
    }
  }
  }

function convertToEuro() {
const gimmeData = new XMLHttpRequest();
gimmeData.open('GET', "https://cors-anywhere.herokuapp.com/https://api.mybitx.com/api/1/ticker?pair=XBTEUR", true);
gimmeData.send();
gimmeData.addEventListener("readystatechange", processRequest, false);
function processRequest(e) {
  if (gimmeData.readyState == 4 && gimmeData.status == 200) {
    const response = JSON.parse(gimmeData.responseText);
    const XBTtoEUR = response.ask;
    const posts = document.getElementsByClassName("converted-value");
    const length = posts.length;
    for (i=0; i<length; i++) {
      console.log(i);
      console.log(posts[i].textContent);
      const reward = posts[i].getAttribute("data-award");
      console.log(reward);
      posts[i].textContent = '(~'+reward*XBTtoEUR/crush+' EUR)';
    }
  }
}
}



const searchInput = document.querySelector('.postSearch');
searchInput.addEventListener('input', function(e){
const posts = document.getElementsByClassName("tweetEntry");
    const length = posts.length;
    for (i=0; i<length; i++) {
     const postContent = posts[i].textContent.toLowerCase();
     const searchTerm=this.value.toLowerCase();
     posts[i].style.display = postContent.includes(searchTerm) ? "block" : "none";
  }
});
