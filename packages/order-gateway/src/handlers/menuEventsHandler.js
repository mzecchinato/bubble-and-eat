/**
 * MenuEventsHandler module
 * @module menuEventsHandler
 */


/** @constant
 * @type{menuActions}
 */
const menuActions = require('../actions/menuActions');

const menuEventsHandler = (() => ({
  /**
   * @function
   * @name menuEventHandler
   * @param {Socket} socket
   * @param {Store} store
   * @desc gets the menu from the store
   */
  menuEventHandler: (socket, store) => {
    socket.emit('menu', store.getState().menu.dishes);
  },

  /**
   * @function
   * @name addDishEventHandler
   * @param {Socket} socket
   * @param {Store} store
   * @param {Object} dish
   * @desc handles the addition of a dish
   */
  addDishEventHandler: (socket, store, dish) => {
    store.dispatch(menuActions.addDish(dish).asPlainObject());
    socket.emit('addedDish', dish);
  },

  /**
   * @function
   * @name removeDishEventHandler
   * @param {Socket} socket
   * @param {Store} store
   * @param {Integer} id
   * @desc handles the removal of a dish
   */
  removeDishEventHandler: (socket, store, id) => {
    store.dispatch(menuActions.removeDish(id).asPlainObject());
    socket.emit('removedDish', id);
  },

  /**
   * @function
   * @name editDishEventHandler
   * @param {Socket} socket
   * @param {Store} store
   * @param {Object} payload
   * @desc handles the editing of a dish
   */
  editDishEventHandler: (socket, store, payload) => {
    store.dispatch(menuActions.editedDish(payload).asPlainObject());
    const filterFunction = element => element.id === payload.id;
    const dishes = store.getState().menu.dishes;
    socket.emit('editedDish', dishes.filter(filterFunction));
  },
}))();

module.exports = menuEventsHandler;

