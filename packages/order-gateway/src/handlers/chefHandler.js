const chefActions = require('../actions/chefActions');
const orderActions = require('../actions/ordersActions');

/**
 * Handles the request emitted from the chef bubble.
 * @module chefHandler
 * @param socket {Socket} Socket for the connection to the server
 * @param store {Redux.Store} Store where data is saved
 * @param orders {Array} List of all orders
 * @param addToDatabaseCompletedOrder {Function} Function to add completed orders to the database
 */
exports.chefHandler = (socket, store, orders, addToDatabaseCompletedOrder) => {
  /**
   * Check whether the order is active or not.
   * @function activeFilterFunction
   * @param element {Object} Order to process
   * @return {Boolean} Returns true if the order is active
   */
  const activeFilterFunction = element => element.state === 'active';
  /**
   * @property ordersInState {Array} Orders contained in the current state of the store
   * */
  let ordersInState = store.getState().order.orders;

  /**
   * @property activeOrders {Array} Orders with active state
   */
  let activeOrders = [];
  if (Array.isArray(ordersInState)) {
    activeOrders = ordersInState.filter(activeFilterFunction);
  }

  socket.on('ready', () => {
    if (activeOrders.length > 0) {
      socket.emit('activeOrdinations', activeOrders);
    }
  });

  // when the chef is connected we register his/her presence in the state
  store.dispatch(chefActions.present(new Date()).asPlainObject());
  console.log('chef connected');
  // when the chef disconnects, register his/her absence in the state
  socket.on('disconnect', () => {
    store.dispatch(chefActions.absent(new Date()).asPlainObject());
  });

  // listen the store for changes in state:
  store.subscribe(() => {
    ordersInState = store.getState().order.orders;
    activeOrders = ordersInState.filter(activeFilterFunction);
    // frontend takes care of empty activeOrders
    socket.emit('activeOrdinations', activeOrders);
  });

  // When the chef marks the dish as prepared, in the backend we receive the order id of the completed order.
  // In order to notify the client we emit an event with the corresponding id.
  // The client is listening for the event with the order id:
  // when he receives the event he knows that his order is ready.
  socket.on('orderCompleted', (id) => {
    store.dispatch(orderActions.completeOrder(id).asPlainObject());
    // persist completed order in db
    // id is unique -> filter can find only one order with the id -> first result is going to be the desired one
    const completedOrder = ordersInState.filter(order => (
            order._id.toString() === id
        ))[0];

    if (typeof completedOrder !== 'undefined') {
      addToDatabaseCompletedOrder(completedOrder);
      orders.emit(id, completedOrder);
      socket.emit('orderCompletedCheck');
    }
  });
};
