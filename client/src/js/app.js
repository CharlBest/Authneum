const abi = '[ { "constant": true, "inputs": [ { "name": "", "type": "bytes32" } ], "name": "assetAuthors", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "owner", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "bytes32" } ], "name": "existingAssets", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "uint256" } ], "name": "assets", "outputs": [ { "name": "author", "type": "address" }, { "name": "assetHash", "type": "bytes32" }, { "name": "price", "type": "uint256" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "author", "type": "address" }, { "name": "assetHash", "type": "bytes32" }, { "name": "price", "type": "uint256" } ], "name": "createAsset", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [ { "name": "index", "type": "uint256" } ], "name": "unlimitedBuyAssetUser", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": false, "inputs": [ { "name": "new_owner", "type": "address" }, { "name": "index", "type": "uint256" } ], "name": "assginOwner", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [ { "name": "author", "type": "address" }, { "name": "assetHash", "type": "bytes32" }, { "name": "index", "type": "uint256" } ], "name": "verifyAuthor", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [ { "name": "owner", "type": "address" }, { "name": "assetHash", "type": "bytes32" }, { "name": "index", "type": "uint256" } ], "name": "verifyAssetOwner", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "view", "type": "function" } ]';
App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    $('#loginItem').hide();
    $.ajax({
      url:'/checksession',
      method:'POST',
      success:function(res){
        if(res.response == false){
          $('#loginItem').hide();
          $('#logoutItem').show();
          //$('#loggedinItem').show();
        } else {
          $('#loginItem').show();
          $('#logoutItem').hide();
          //$('#loggedinItem').hide();
        }
      }
    })

    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }

    });

    $('#logIn').submit(function(event){ 
        const username = $('#logIn input[name="email"]').val();
        const password = $('#logIn input[name="password"]').val();
        $.ajax({
          url: '/login',
          method:'POST',
          data: {username, password},
          success:function(res){
            console.log(res);
            if(res.response == 'success'){
              console.log(res)
              window.location.href='/';
            }
          }
        })
        event.preventDefault();
    })

    $('#regForm').submit(function(event){
        event.preventDefault();
        const username = $('#regForm input[name="email"]').val();
        const address = $('#regForm input[name="address"]').val();
        const display_name = $('#regForm input[name="fullname"]').val();
        const password = $('#regForm input[name="password"]').val();
        $.ajax({
          url: '/register',
          method:'POST',
          data: {username, address,display_name, password},
          success:function(res){
            console.log(res)
          }
        })
      
    })

    return await App.initWeb3();
  },

  initWeb3: async function() {
    /*
     * Replace me...
     */
     if( 
      // Check if we are in the Browser - returns 'object' in case it is in the browser
      typeof window !== 'undefined' 
      // Check if web3 is injected from Metamask - returns 'object' in case it has been injected
      && typeof window.web3 !== 'undefined'
  ){
      // Grab web3 version from injected web3 version from Metamask
      web3 = new Web3(window.web3.currentProvider);  
  } else {
      console.log('infura')
      // Not in the browser (e.g. server-side, using next.js) OR the user does not have Metamask installed
      // Connect through Infura to the Ethereum network
      const provider = new Web3.providers.HttpProvider(
          'https://rinkeby.infura.io/v3/992f568367ff44fe88d1fa138f35adf5'
      );
      web3 = new Web3(provider);
  }



    return App.initContract();
  },

  initContract: async function() {
    /*
     * Replace me...
     */
    console.log(web3);
    const instance = new web3.eth.Contract(
    JSON.parse(abi),
    '0xdB40D94f78F76e15E1095Ae8f16b2392762CB2de'); 
    return App.bindEvents(instance);
  },

  bindEvents: function(instance) {
    $(document).on('click', '.btn-adopt', App.handleAdopt);

    //Bind events
    $(document).on('click', '#uploadButton', function (event) {
      // Get file upload
      event.preventDefault();
      var $fileToUpload = $('#fileToUpload');

      function ascii_to_hexa(str) {
        var arr1 = [];
        for (var n = 0, l = str.length; n < l; n++) {
          var hex = Number(str.charCodeAt(n)).toString(16);
          arr1.push(hex);
        }
        return arr1.join('');
      }

      // Check if it exists
      if ($fileToUpload && $fileToUpload[0] && $fileToUpload[0].files && $fileToUpload[0].files[0]) {
        const file = $fileToUpload[0].files[0];

        const reader = new FileReader();
        reader.onload = async function (blob) {
          var file_result = this.result;
          var file_wordArr = CryptoJS.lib.WordArray.create(file_result);
          var sha_hash = CryptoJS.SHA256(file_wordArr);

          //As part of the Hachathon we have cut this off to store a bytes32 value
          //Would rework this in prod version
          const byteArray = web3.utils.fromAscii(sha_hash.toString()).substr(0,66);
          console.log(byteArray);
          var user_address = JSON.parse(localStorage.getItem('user')).address;
          console.log(user_address)
          const asset = await instance.methods.createAsset(user_address,byteArray,100)
          .send({
            from: user_address,
            gas:'1000000'
          })
          const new_asset = await instance.methods.assets(1).call();
          console.log(new_asset);
        };
        
        reader.readAsArrayBuffer(file);
      }
      App.handleAdopt(event);
    });

  },

  markAdopted: function(adopters, account) {
    /*
     * Replace me...
     */
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    /*
     * Replace me...
     */
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
