import { contractAddress, abi } from "../js/constants.js";

const connectButton = document.getElementById("section-hero__button_connect");
const showAllNFTButton = document.getElementById("section-hero__button_show-all-nft");
const sendButton = document.getElementById("section-hero__item-button_send");
const createBiometricsButton = document.getElementById("section-hero__item-button_create-biom");
const showOwnerButton = document.getElementById("section-hero__item-button_show-owner");
const burnNFTButton = document.getElementById("section-hero__item-button_burn-nft");

connectButton.onclick = connect;
showAllNFTButton.onclick = showAllNFT;
sendButton.onclick = send;
createBiometricsButton.onclick = createBiometrics;
showOwnerButton.onclick = showOwner;
burnNFTButton.onclick = burnNFT;

function onScanSuccess(qrCodeMessage) {
  let recipientAddressInput = document.getElementById("section-hero__item-input_address");
  recipientAddressInput.value = qrCodeMessage.split(":").pop()
}

function onScanError(errorMessage) {
  console.log(errorMessage);
}

var html5QrcodeScanner = new Html5QrcodeScanner(
  "reader", { fps: 10, qrbox: 250 });
html5QrcodeScanner.render(onScanSuccess, onScanError);

async function getAccounts() {
  try {
    return await window.ethereum.request({ method: "eth_requestAccounts" });
  } catch (error) {
    console.log(error);
  }
}

async function getTokenIdsByTrueOwner() {
  if (typeof window.ethereum !== "undefined") {
    var web3 = new Web3(Web3.givenProvider);
    window.contract = await new web3.eth.Contract(abi, contractAddress);
    const tokenIds = await window.contract.methods.getTokenIdsByTrueOwner((await getAccounts())[0]).call();
    return tokenIds;
  }
}

async function getOwner(tokenId) {
  if (typeof window.ethereum !== "undefined") {
    var web3 = new Web3(Web3.givenProvider);
    window.contract = await new web3.eth.Contract(abi, contractAddress);
    const owner = await window.contract.methods.ownerOf(tokenId).call();
    return owner;
  }
}

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    const accounts = getAccounts();
    connectButton.innerText = "Connected";
    return accounts[0];
  } else {
    connectButton.innerText = "Please install MetaMask";
  }
}

async function showAllNFT() {
  let allNFTOutput = document.getElementById("section-hero__out-all-nft");
  allNFTOutput.innerHTML = "";
  if (typeof window.ethereum !== "undefined") {
    var web3 = new Web3(Web3.givenProvider);
    window.contract = await new web3.eth.Contract(abi, contractAddress);
    try {
      let tokenIds = await getTokenIdsByTrueOwner();
      if (tokenIds.length !== 0) {
        tokenIds.forEach(async tokenId => {
        let owner = await getOwner(Number(tokenId));
        allNFTOutput.innerHTML += tokenId + ": " + owner + "<br/>";
        })
      } else {
        allNFTOutput.innerHTML = "NFT doesn't exist";
      }
    } catch (error) {
      console.log(error);
      allNFTOutput.innerHTML = "ERROR! NFTs doesn't exist";
    }
  }
}

async function send() {
  let recipientAddressInput = document.getElementById("section-hero__item-input_address");
  let tokenIdInput = document.getElementById("section-hero__item-input_id-nft-for-send");
  let sendOutput = document.getElementById("section-hero__out-send");
  if (typeof window.ethereum !== "undefined") {
    var web3 = new Web3(Web3.givenProvider);
    window.contract = await new web3.eth.Contract(abi, contractAddress);
    const fromAddress = (await getAccounts())[0];
    const transactionParameters = {
      to: contractAddress,
      from: fromAddress,
      value: '0',
      data: window.contract.methods.safeTransferFrom(
        fromAddress, 
        recipientAddressInput.value,
        tokenIdInput.value)
        .encodeABI(),
    };
    try {
      await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
      recipientAddressInput.value = "";
      tokenIdInput.value = "";
      sendOutput.innerHTML = "NFT has sent";
    } catch (error) {
      sendOutput.innerHTML = "ERROR! NFT can't be sent";
    }
  }
}

async function createBiometrics() {
  let biomInput = document.getElementById("section-hero__item-input_biom");
  let createOutput = document.getElementById("section-hero__out-create");
  if (typeof window.ethereum !== "undefined") {
    var web3 = new Web3(Web3.givenProvider);
    window.contract = await new web3.eth.Contract(abi, contractAddress);
    const fromAddress = (await getAccounts())[0];
    const transactionParameters = {
      to: contractAddress,
      from: fromAddress,
      value: '0',
      data: window.contract.methods.createBiom(biomInput.value).encodeABI(),
    };
    try {
      await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
      biomInput.value = "";
      createOutput.innerHTML = "Biometrics created";
    } catch (error) {
      sendOutput.innerHTML = "ERROR! Biometrics can't be created";
    }
  }
}

async function showOwner() {
  let tokenIdInput = document.getElementById("section-hero__item-input_id-nft-for-owner");
  let ownerOutput = document.getElementById("section-hero__out-owner");
  try {
    let owner = await getOwner(tokenIdInput.value);
    tokenIdInput.value = "";
    ownerOutput.innerHTML = owner;
  } catch (error) {
    ownerOutput.innerHTML = "ERROR! NFT doesn't exist";
  }
  
}

async function burnNFT() {
  let tokenIdInput = document.getElementById("section-hero__item-input_id-nft-for-burn");
  let burnOutput = document.getElementById("section-hero__out-burn");
  if (typeof window.ethereum !== "undefined") {
    var web3 = new Web3(Web3.givenProvider);
    window.contract = await new web3.eth.Contract(abi, contractAddress);
    const fromAddress = (await getAccounts())[0];
    const transactionParameters = {
      to: contractAddress,
      from: fromAddress,
      value: '0',
      data: window.contract.methods.burn(tokenIdInput.value).encodeABI(),
    };
    try {
      await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
      tokenIdInput.value = "";
      burnOutput.innerHTML = "NFT has burned";
    } catch (error) {
      burnOutput.innerHTML = "ERROR! NFT can't be burned";
    }
  }
}