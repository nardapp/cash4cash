//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";


contract Offers {

  /// CCIP
  address link;
  //address router;

  /*constructor(address _link, address _router) {
    link = _link;
    router = _router;
    LinkTokenInterface(link).approve(router, type(uint256).max);
  }*/

  function sendOffer(
    address router,
    address receiver, 
    Offer memory offer, 
    uint64 destinationChainSelector
  ) internal {
    Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
      receiver: abi.encode(receiver),
      data: abi.encode(offer),
      tokenAmounts: new Client.EVMTokenAmount[](0),
      extraArgs: "",
      feeToken: link
    });

    IRouterClient(router).ccipSend(destinationChainSelector, message);
  }
  
  struct Blockchain {
    string name;
    address router;
    uint64 selector; // destinationChainSelector
    address orderContract;
  }

  /// Offer

  enum OfferStatus {
    Given,
    Taken,
    Removed
  }

  struct Offer {
    uint id;
    address requestant;
    address agent;
    uint amount;
    string ticker;
    string distance;
    Blockchain target;
    OfferStatus status;
  }

  mapping(uint => Offer) public offerBook;
  Offer[] public offersList;

  event OfferCreated(uint _id, Offer _offer);

  function getAllOffers() public view returns(Offer[] memory) {
    return offersList;
  }

  function getOffer(uint _id) public view returns(Offer memory) {
    return offerBook[_id];
  }

  function getOFferStatus(uint _id) public view returns(OfferStatus) {
    return offerBook[_id].status;
  }

  function updateStatus(uint _id, OfferStatus _status) public {
    offerBook[_id].status = _status; // Updating by numbers (uint8)
  }

  function createOffer(
    address _requestant,
    address _agent,
    uint    _amount,
    string memory _ticker,
    string memory _distance,
    Blockchain memory _target
  ) public {
    Offer memory newOffer;
    newOffer.requestant = _requestant;
    newOffer.agent    = _agent;
    newOffer.amount     = _amount;
    newOffer.ticker     = _ticker;
    newOffer.distance   = _distance;
    newOffer.target     = _target;
    newOffer.status     = OfferStatus.Given;
    newOffer.id         = offersList.length;

    offerBook[newOffer.id] = newOffer;
    offersList.push(newOffer);

    sendOffer(
      /*address*/ newOffer.target.router, 
      /*address*/ newOffer.target.orderContract,
      /*Offer*/ newOffer,  
      /*destinationChainSelector*/ newOffer.target.selector 
    );

    emit OfferCreated(newOffer.id, newOffer);
  }

  /// dev. mode

  mapping(uint => address) public senders; 
  mapping(uint => address) public receivers; 
  mapping(uint => address) public agents; 
  mapping(uint => string) public tickers; 
  mapping(uint => string) public locId; 
  mapping(uint => Blockchain) public blockchains; 

  function _createOffer(bool _multiple) public {

    senders[0] = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
    senders[1] = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2;
    senders[2] = 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db;
    senders[3] = 0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB;
    senders[4] = 0x617F2E2fD72FD9D5503197092aC168c91465E7f2;

    receivers[0] = 0x17F6AD8Ef982297579C203069C1DbfFE4348c372;
    receivers[1] = 0x5c6B0f7Bf3E7ce046039Bd8FABdfD3f9F5021678;
    receivers[2] = 0x03C6FcED478cBbC9a4FAB34eF9f40767739D1Ff7;
    receivers[3] = 0x1aE0EA34a72D944a8C7603FfB3eC30a6669E454C;
    receivers[4] = 0x0A098Eda01Ce92ff4A4CCb7A4fFFb5A43EBC70DC;

    agents[0] = 0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c;
    agents[1] = 0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C;
    agents[2] = 0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB;
    agents[3] = 0x583031D1113aD414F02576BD6afaBfb302140225;
    agents[4] = 0xdD870fA1b7C4700F2BD7f44238821C26f7392148;

    blockchains[0] = Blockchain(
      "sepolia", // name
      0xD0daae2231E9CB96b94C8512223533293C3693Bf, // router
      16015286601757825753, // selector
      0x34d9735668f42B78B3838616eaE53b5c9C594EC0 // order contract
    );
    
    tickers[0] = "USDT";
    tickers[1] = "USDC";
    tickers[2] = "BUSD";
    tickers[3] = "EURS";
    tickers[4] = "BRZ";

    locId[0] = "Florida";
    locId[1] = "Phuket";
    locId[2] = "Montreal";
    locId[3] = "Rio";
    locId[4] = "Bangok";

    if (_multiple) {
      for(uint8 i = 0; i < 5; i++) {
        createOffer( 
          senders[i], receivers[i], 
          100, tickers[i], locId[i], 
          blockchains[0]
        );
      }
    } else {
      createOffer(
        0x5B38Da6a701c568545dCfcB03FcB875f56beddC4,
        0xdD870fA1b7C4700F2BD7f44238821C26f7392148,
        100, "USDT", "Some Location ID", blockchains[0]
      );
    }
  }

}
