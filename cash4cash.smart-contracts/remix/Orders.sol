// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {MockUSDC} from "./MockUSDC.sol";

/*

	WIP 2023-12-09-08-21

*/

contract Orders is CCIPReceiver {

    address router; // Will be the address of the router of hte chain that deployed

    MockUSDC public usdcToken;
    LinkTokenInterface linkToken;

    constructor(address _router, address link) CCIPReceiver(_router) {
        linkToken = LinkTokenInterface(link);
        usdcToken = new MockUSDC();
    }

    /// CCIP
    /*
        - Order can sends funds & Order 
        - Order can recieve funds & Order
        - Order emits events of sending
        - Order keeps track of the received messages in a struct
        
    */
    event MessageSent(
        bytes32 indexed messageId, // The unique ID of the message.
        uint64 indexed destinationChainSelector, // The chain selector of the destination chain.
        address receiver, // The address of the receiver on the destination chain.
        //address borrower, // The borrower's EOA - would map to a depositor on the source chain.
        Client.EVMTokenAmount tokenAmount, // The token amount that was sent.
        uint256 fees // The fees paid for sending the message.
    );

    // Event emitted when a message is received from another chain.
    event MessageReceived(
        bytes32 indexed messageId, // The unique ID of the message.
        uint64 indexed sourceChainSelector, // The chain selector of the source chain.
        address sender, // The address of the sender from the source chain.
        address depositor, // The EOA of the depositor on the source chain
        Client.EVMTokenAmount tokenAmount // The token amount that was received.
    );

    // Struct to hold details of a message.
    struct MessageIn {
        uint64 sourceChainSelector; // The chain selector of the source chain.
        address sender; // The address of the sender.
        address depositor; // The content of the message.
        address token; // received token.
        uint256 amount; // received amount.
    }

    bytes32[] public receivedMessages; // Array to keep track of the IDs of received messages.
    mapping(bytes32 => MessageIn) public messageDetail; // Mapping from message ID to MessageIn struct, storing details of each received message.
    mapping(address => mapping(address => uint256)) public deposits; // Depsitor Address => Deposited Token Address ==> amount
    //mapping(address => mapping(address => uint256)) public borrowings; // Depsitor Address => Borrowed Token Address ==> amount

    /// handle a received message
    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage) internal override {
        bytes32 messageId = any2EvmMessage.messageId; // fetch the messageId
        uint64 sourceChainSelector = any2EvmMessage.sourceChainSelector; // fetch the source chain identifier (aka selector)
        address sender = abi.decode(any2EvmMessage.sender, (address)); // abi-decoding of the sender address
        address depositor = abi.decode(any2EvmMessage.data, (address)); // abi-decoding of the depositor's address

        // Collect tokens transferred. This increases this contract's ba0lance for that Token.
        Client.EVMTokenAmount[] memory tokenAmounts = any2EvmMessage.destTokenAmounts;
        address token = tokenAmounts[0].token;
        uint256 amount = tokenAmounts[0].amount;

        receivedMessages.push(messageId);
        MessageIn memory detail = MessageIn(sourceChainSelector, sender, depositor, token, amount);
        messageDetail[messageId] = detail;

        emit MessageReceived(messageId, sourceChainSelector, sender, depositor, tokenAmounts[0]);

        // Store depositor data.
        deposits[depositor][token] += amount;
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
        address agent; 
        uint256 amount; 
        uint256 offer; // Agents offer e.g. conversion rate 1 USD = 32.25 BAHT
        string fromCurrency; // ticker USDT / USDC / BUSD ...
        string toCurrency; // Fiat currency that will be given as cash to the receiver
        string locationId; 
        Blockchain target;
        OrderStatus status; 
    }

    mapping(uint256 => Order) public orderBook;
    Order[] public orders;

    event OrderCreated(
        uint256 indexed orderId,
        address sender,
        address receiver,
        uint256 amount,
        string fromCurrency,
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
        string fromCurrency,
        string toCurrency
    );

    event OrderCanceled(
        uint256 indexed orderId,
        address sender,
        address receiver,
        uint256 amount,
        string fromCurrency,
        string toCurrency
    );

    function createOrder(
        address _receiver,
        address _agent,
        uint256 _amount,
        uint256 _offerRate,
        string memory _fromCurrency,
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

    error notTheRightSender();

    modifier onlySender(uint _orderId){
        require(msg.sender == orderBook[_orderId].sender, "User is not the requestant of this order.");
        _;
    }

    modifier onlyAgent(uint _orderId){
        require(msg.sender == orderBook[_orderId].agent, "User is not the agent of this order.");
        _;
    }

    function deposit(uint _orderId) public onlySender(_orderId) payable {
        require(msg.value >= orderBook[_orderId].amount, "Not the right amount of funds to deposit.");
        // Lock the funds
        emit OrderInProgress(_orderId, orderBook[_orderId].agent);
    }

    struct Blockchain {
        string name;
        address router; // Other Order Contract or EOA of an agent
        uint64 selector; // destinationChainSelector
        address orderContract;
    }

    function withdraw(uint _orderId) public onlyAgent(_orderId) {
        address transferredToken = messageDetail[msgId].token;
        uint256 deposited = deposits[msg.sender][transferredToken];

        sendMessage(
            /*uint64 destinationChainSelector,*/ orderBook[_orderId].target.selector, 
            /*address receiver,*/ orderBook[_orderId].agent, // directly to agent's EOA
            /*address tokenToTransfer,*/ transferredToken, 
            /*uint256 transferAmount*/ orderBook[_orderId].amount 
        );
    }

    function sendMessage(
        uint64 destinationChainSelector,
        address receiver,
        address tokenToTransfer,
        uint256 transferAmount
    ) internal returns (bytes32 messageId) {
        address borrower = msg.sender;

        // Compose the EVMTokenAmountStruct. This struct describes the tokens being transferred using CCIP.
        Client.EVMTokenAmount[] memory tokenAmounts = new Client.EVMTokenAmount[](1);

        Client.EVMTokenAmount memory tokenAmount = Client.EVMTokenAmount({token: tokenToTransfer, amount: transferAmount});
        tokenAmounts[0] = tokenAmount;

        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver), // ABI-encoded receiver address
            data: abi.encode(borrower), // ABI-encoded string message
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000, strict: false}) // Additional arguments, setting gas limit and non-strict sequency mode
            ),
            feeToken: address(linkToken) // Setting feeToken to LinkToken address, indicating LINK will be used for fees
        });
    }


    function assignagent(uint256 _orderId, address _agent) external {
        Order storage order = orders[_orderId - 1];

        require(
            _orderId - 1 < orders.length, 
            "That order doesn't exist."
        );
        require(
            order.status == OrderStatus.Created,
            "This order is already either in progress, complete or canceled."
        );
        require(
            msg.sender == order.sender,
            "Only the sender can assign a agent."
        );

        order.agent = _agent;
        order.status = OrderStatus.InProgress;

        emit OrderInProgress(_orderId, _agent);
    }

    function completeOrder(uint256 _orderId) external {
        require(_orderId - 1 < orders.length, "Order doesn't exist.");

        Order storage order = orders[_orderId - 1];
        
        require(
            order.status == OrderStatus.InProgress,
            "Order must be in progress to complete."
        );
        // require(
        //     msg.sender == order.agent,
        //     "Only the agent can complete the order."
        // );

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

    function cancelOrder(uint256 _orderId) external {
        Order storage order = orders[_orderId - 1];

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

    function getOrder(uint256 _orderId) public view returns (Order memory) {
        require(_orderId - 1 < orders.length, "That order doesn't exist");
        return orders[_orderId - 1];
    }

    function getOrderByMap(uint256 _orderId) public view returns(Order memory){
        return orderBook[_orderId];
    }

    function getOrderStatus(uint256 _orderId) public view returns(OrderStatus){
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

    //event FundsSent(address, uint64, string);
    //function sendFundsToNetwork(
    //    address receiverContract, 
    //    string memory status, 
    //    uint64 destChain,
    //    address feeToken,
    //    address router
    //) public {
    //    CCIPSender_Unsafe ccSender = new CCIPSender_Unsafe(feeToken, router);
    //    ccSender.sendCC(receiverContract, status, destChain);
    //    emit FundsSent(receiverContract, destChain, status);
    //}
    
}