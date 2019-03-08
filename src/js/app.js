// Store all the javascript code
const list = document.querySelector('.tweetEntry-tweetHolder')
const myPost = document.querySelector('.formHolder');
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

App = {
  loading: false,
  contracts: {},
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

  renderPosts: async() => {
    const postCount = await App.CrushChain.postsCount()
    for (var i = 0; i <= postCount-1; i++) {
      const post = await App.CrushChain.posts(i)
      const postId = post[0].toNumber()
      const content = post[1]
      const owner = post[2]
      const timestamp = post[3].toNumber()
      const award = post[4]
      const claimed = post[5]
      const flags = post[6]
      const likes = post[7]

      var temp = document.getElementById("post-template");
      postbox = temp.content.cloneNode(true);
      item = postbox.querySelector(".tweetEntry-text-container");
      item.textContent = content;
      // Also fill its timestamp
      item = postbox.querySelector(".tweetEntry-timestamp");
      console.log(timestamp);
      item.textContent = timestampToString(timestamp);


      // Fill avatar with some random cat image for lols
      item = postbox.getElementById("catImg");
      num = (Math.floor(Math.random()*10) + 10 ) * 5;
      item.src = "http://placekitten.com/" + num + "/" + num;

      list.appendChild(postbox);
    }
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



list.addEventListener('click', function(e){
  // Listener for like button
  if (e.target.className == 'fa fa-heart') {
    console.log('liked')
  };
});

/*
myPost.addEventListener('click', function(e){
  if (e.target.className == 'btn btn-primary') {
    // Listen for the Post button being clicked
    const content = e.target.parentElement.querySelector(".form-group textarea");
    const post_message = content.value;
    // Get post message
    if (post_message != "") {
      // Get current timestamp
      var date = new Date();
      var timestamp = date.getTime();
      // Display in human readable form
      var d = new Date(timestamp);
      const time = d.getDate() + ' ' + monthNames[d.getMonth()]
                   + ' at ' + d.getHours() + ':' + d.getMinutes();
      // Create a new postbox and populate it with post message from earlier
      var temp = document.getElementById("post-template");
      postbox = temp.content.cloneNode(true);
      item = postbox.querySelector(".tweetEntry-text-container");
      item.textContent = post_message;
      // Also fill its timestamp
      item = postbox.querySelector(".tweetEntry-timestamp");
      item.textContent = time;

      item = postbox.getElementById("catImg");
      item.src = "http://placekitten.com/50/50"

      list.appendChild(postbox);
      content.value = "";
    }
  };
})
*/
