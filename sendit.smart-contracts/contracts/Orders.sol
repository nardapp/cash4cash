// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/token/ERC20/IERC20.sol";
import {IERC165} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.0/utils/introspection/IERC165.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/*
    2023-12-10-02-10
	TESTING 
    NOT AUDITED
*/

contract Orders is CCIPReceiver, ReentrancyGuard {
    
    LinkTokenInterface linkToken;

    constructor(address _router, address link) CCIPReceiver(_router) {
        linkToken = LinkTokenInterface(link);
    }
    
    event MessageSent(
        bytes32 indexed messageId, 
        uint64 indexed destinationChainSelector, 
        address receiver, 
        Order indexed order,
        Client.EVMTokenAmount tokenAmount, 
        uint256 fees 
    );

    event MessageReceived(
        bytes32 indexed messageId, 
        uint64 indexed sourceChainSelector, 
        address sender, 
        Order indexed order,
        Client.EVMTokenAmount tokenAmount 
    );

    // Struct to hold details of a message.
    struct MessageIn {
        uint64 sourceChainSelector; 
        address sender; 
        Order order; // message data
        address token; // received token.
        uint256 amount; // received amount.
    }

    bytes32[] public receivedMessages; // Keeps track of the IDs of received messages.
    mapping(bytes32 => MessageIn) public messageDetail; // Message details, message id => message data.
    mapping(uint256 => mapping(address => uint256)) public deposits; // Order => sender ==> amount
    
    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage) internal override {
        bytes32 messageId = any2EvmMessage.messageId; 
        uint64 sourceChainSelector = any2EvmMessage.sourceChainSelector; 
        address sender = abi.decode(any2EvmMessage.sender, (address)); // sender contract's address
        // Order [ + unlocking code] 
        Order memory order = abi.decode(any2EvmMessage.data, (Order)); // the Order data 

        // Collect tokens transferred. This increases this contract's balance for that Token.
        Client.EVMTokenAmount[] memory tokenAmounts = any2EvmMessage.destTokenAmounts;
        address token = tokenAmounts[0].token;
        uint256 amount = tokenAmounts[0].amount;

        receivedMessages.push(messageId);
        MessageIn memory detail = MessageIn(sourceChainSelector, sender, order, token, amount);
        messageDetail[messageId] = detail;

        emit MessageReceived(messageId, sourceChainSelector, sender, order, tokenAmounts[0]);

        deposits[order.orderId][token] += amount; // Store depositor data
    }

    function sendMessage(
        uint64 destinationChainSelector,
        address receiver,
        address tokenToTransfer,
        uint256 transferAmount
    ) internal returns (bytes32 messageId) {
        Order memory order;

        // Compose the EVMTokenAmountStruct. This struct describes the tokens being transferred using CCIP.
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);

        Client.EVMTokenAmount memory tokenAmount = Client.EVMTokenAmount({
            token: tokenToTransfer, 
            amount: transferAmount
        });
        tokenAmounts[0] = tokenAmount;

        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver), // encoded receiver address
            data: abi.encode(order), // encoded string message 
            tokenAmounts: tokenAmounts,
            extraArgs: "", /* Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000, strict: false}) 
            ),*/
            feeToken: address(linkToken) 
        });

        // Initialize a router client instance to interact with cross-chain
        IRouterClient router = IRouterClient(this.getRouter());

        // Get the fee required to send the message
        uint256 fees = router.getFee(destinationChainSelector, evm2AnyMessage);

        // Approve the Router to send LINK tokens on contract's behalf. Fees are in LINK
        linkToken.approve(address(router), fees);

        require(IERC20(tokenToTransfer).approve(address(router), transferAmount), "Failed to approve router");

        // Send the message through the router and store the returned message ID
        messageId = router.ccipSend(destinationChainSelector, evm2AnyMessage);

        // Emit an event with message details
        emit MessageSent(messageId, destinationChainSelector, receiver, order, tokenAmount, fees);

        deposits[order.orderId][tokenToTransfer] -= transferAmount;
        
        // Return the message ID
        return messageId;
    }


    /// Orders

    enum OrderStatus {
        Created,
        InProgress,
        Completed,
        Canceled
    }

    struct Order {
        uint256 orderId;
        address sender; 
        address receiver; 
        uint256 amount; 
        address agent; 
        uint256 offer; // Agents offer e.g. conversion rate 1 USD = 32.25 BAHT
        address fromCurrency; 
        string toCurrency; // Fiat currency that will be given as cash to the receiver
        string locationId; 
        Blockchain target;
        OrderStatus status; 
    }

    struct Blockchain {
        string name;
        address router; // Other Order Contract or EOA of an agent
        uint64 selector; // destinationChainSelector
        address orderContract;
    }

    mapping(uint256 => Order) public orderBook;
    Order[] public orders;

    event OrderCreated(
        uint256 indexed orderId,
        address sender,
        address receiver,
        uint256 amount,
        address fromCurrency,
        string toCurrency
    );

    event OrderInProgress(
        uint256 indexed orderId, 
        address agent
    );

    event OrderCompleted(
        uint256 indexed orderId,
        address sender,
        address receiver,
        uint256 amount,
        address fromCurrency,
        string toCurrency
    );

    event OrderCanceled(
        uint256 indexed orderId,
        address sender,
        address receiver,
        uint256 amount,
        address fromCurrency,
        string toCurrency
    );

    modifier onlySender(uint _orderId){
        require(msg.sender == orderBook[_orderId].sender, "User is not the requestant of this order.");
        _;
    }

    modifier onlyAgent(uint _orderId){
        require(msg.sender == orderBook[_orderId].agent, "User is not the agent of this order.");
        _;
    }

    modifier mustExist(uint _orderId){
        require(_orderId - 1 < orders.length, "That order doesn't exist");
        _;
    }

    modifier onlyReceiver(uint _orderId){
        require(msg.sender == orderBook[_orderId].receiver);
        _;
    }

    function createOrder(
        address _receiver,
        address _agent,
        uint256 _amount,
        uint256 _offerRate,
        address _fromCurrency,
        string memory _toCurrency,
        string memory _locationId,
        Blockchain memory _target
    ) public {
        require(_amount > 0, "Amount must be greater than zero.");
        require(_receiver != msg.sender, "Receiver cannot be the same as the sender.");

        uint256 _orderId = orders.length + 1;

        Order memory newOrder = Order({
            orderId: _orderId,
            sender: msg.sender,
            receiver: _receiver,
            agent: _agent,
            amount: _amount,
            offer: _offerRate,
            fromCurrency: _fromCurrency,
            toCurrency: _toCurrency,
            locationId: _locationId,
            target: _target,
            status: OrderStatus.Created
        });

        orderBook[newOrder.orderId] = newOrder;
        orders.push(newOrder);

        emit OrderCreated(
            _orderId,
            msg.sender,
            _receiver,
            _amount,
            _fromCurrency,
            _toCurrency
        );
    }

    function completeOrder(uint256 _orderId) external mustExist(_orderId) onlyReceiver(_orderId) {

        //Order storage order = orders[_orderId - 1];
        Order storage order = orderBook[_orderId];
        
        require(
            order.status == OrderStatus.InProgress,
            "Order must be in progress to complete."
        );
        require(
            msg.sender != order.agent,
            "Agents are not allowed to close orders."
        );

        order.status = OrderStatus.Completed;
        
        emit OrderCompleted(
            _orderId,
            order.sender,
            order.receiver,
            order.amount,
            order.fromCurrency,
            order.toCurrency
        );
    }

    function cancelOrder(uint256 _orderId) external mustExist(_orderId) {
        //Order storage order = orders[_orderId - 1];
        Order storage order = orderBook[_orderId];

        require(
            msg.sender == order.sender || msg.sender == order.agent, 
            "Only the creator of this order or the selected agent can cancel this order."
        );
        require(
            order.status != OrderStatus.Completed, 
            "This order has already been completed."
        );
        require(
            order.status != OrderStatus.Canceled, 
            "This order has already been canceled."
        );

        order.status = OrderStatus.Canceled;
        
        emit OrderCanceled(
            _orderId,
            order.sender,
            order.receiver,
            order.amount,
            order.fromCurrency,
            order.toCurrency
        );
    }

    // Sender deposits that to be sent to the agent
    function deposit(uint _orderId) public payable nonReentrant mustExist(_orderId) onlySender(_orderId) {        
        require(msg.value >= orderBook[_orderId].amount, "Not the right amount of funds to deposit.");
        
        ///* Fund-locking mech. in here *///

        orderBook[_orderId].status = OrderStatus.InProgress;
        
        emit OrderInProgress(_orderId, orderBook[_orderId].agent);
    }

    function withdraw(uint _orderId) public mustExist(_orderId) nonReentrant {
        // NOT TESTED YET!
        require(orderBook[_orderId].status == OrderStatus.Completed, "Order is not closed yet.");
        
        address claimant;
        if      (msg.sender == orderBook[_orderId].sender) claimant = orderBook[_orderId].sender;
        else if (msg.sender == orderBook[_orderId].agent)  claimant = orderBook[_orderId].agent;
        
        if (orderBook[_orderId].target.orderContract == address(this)) {
            (bool sent, ) = msg.sender.call{value: orderBook[_orderId].amount}("");
		    require(sent == true, "Payment failed!");
        } else {
            sendMessage(
                /*uint64 destinationChainSelector,*/ orderBook[_orderId].target.selector, 
                /*address receiver,*/ claimant, // directly to a personal EOA
                /*address tokenToTransfer,*/ orderBook[_orderId].fromCurrency, 
                /*uint256 transferAmount*/ orderBook[_orderId].amount 
            );
        }
    }

    function getOrdersList(uint256 _orderId) public view mustExist(_orderId) returns(Order memory) {
        return orders[_orderId - 1];
    }

    function getOrder(uint256 _orderId) public view mustExist(_orderId) returns(Order memory){
        return orderBook[_orderId];
    }

    function getOrderStatus(uint256 _orderId) public mustExist(_orderId) view returns(OrderStatus){
        return orderBook[_orderId].status;
    }

    function getCreatedOrders() public view returns (Order[] memory) {     
        uint256 count = 0;

        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].status == OrderStatus.Created) {
                count++;
            }
        }

        Order[] memory createdOrders = new Order[](count);
        count = 0;

        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].status == OrderStatus.Created) {
                createdOrders[count] = orders[i];
                count++;
            }
        }

        return createdOrders;
    }
    
}
