import { contractAddress, abi } from "../js/constants.js";

const connectButton = document.getElementById("section-hero__button_connect");
const showAllNFTButton = document.getElementById("section-hero__button_show-all-nft");
const scanQRButton = document.getElementById("section-hero__item-button_scan-qr");
const sendButton = document.getElementById("section-hero__item-button_send");
const showOwnerButton = document.getElementById("section-hero__item-button_show-owner");
const burnNFTButton = document.getElementById("section-hero__item-button_burn-nft");

connectButton.onclick = connect;
showAllNFTButton.onclick = showAllNFT;
scanQRButton.onclick = scanQR;
sendButton.onclick = send;
showOwnerButton.onclick = showOwner;
burnNFTButton.onclick = burnNFT;

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
      tokenIds.forEach(async tokenId => {
        let owner = await getOwner(Number(tokenId));
        allNFTOutput.innerHTML += tokenId + ": " + owner + "<br/>";
      })
    } catch (error) {
      console.log(error);
      allNFTOutput.innerHTML = "ERROR! NFTs doesn't exist";
    }
  }
}

async function scanQR() {
  let recipientAddressInput = document.getElementById("section-hero__item-input_address");
  

  // var new_window;
  // new_window = window.open('', '_blank');
  // var html_contents = document.getElementById("html_contents");
  // if(html_contents !== null) {
  //     new_window.document.write('<!doctype html><html><head><title>SCAN QR</title><meta charset="UTF-8" /></head><body>' + html_contents.innerHTML + '</body></html>');
  // }
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