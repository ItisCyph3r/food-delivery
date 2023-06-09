import "./App.scss";
import { RouterProvider } from "react-router-dom";
import { useMemo, useEffect, useReducer, createContext } from "react";
import router from './router'
import axios from "axios";
import{ safeGetItem } from "./utils"

const getInitialState = () => {
  return {
    user: JSON.parse(localStorage.getItem('currentUser') ?? null ),
    cartItems: [],
  };
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      const { cart, session, ...user } = action.payload 

      // Save the session and user data to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('session', JSON.stringify(session));

      // Update the state with the user data
      return {
        ...state,
        user, cartItems: cart
      };
    case "LOGOUT":
      // Remove the user data from localStorage
      localStorage.removeItem('currentUser');
      localStorage.removeItem('session');

      // Reset the state to the initial state
      return getInitialState();
    case "SET_ITEMS":
       // Update the state with the cart items
    const updatedState = {
      ...state,
      cartItems: action.payload,
    };

    // Save the updated cart items to localStorage
    localStorage.setItem('cartItems', JSON.stringify(action.payload));

    return updatedState;

    default:
      return state;
  }
};

export const AppContext = createContext(null)

function App() {
  const [state, dispatch] = useReducer(reducer, getInitialState());
  
  useEffect(() => {
    const savedCartItems = localStorage.getItem('cartItems');
    if (savedCartItems) {
        dispatch({ type: 'SET_ITEMS', payload: JSON.parse(savedCartItems) })
    }
    else{
      console.log('THis shit is empty fam')
    }
  }, []); 

  useEffect(() => {
    if (state.user && state.cartItems.length > 0) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
      const updatedUser = { ...currentUser, cart: state.cartItems };
      console.log(updatedUser)
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      axios.put(`http://localhost:5000/${updatedUser.userId}/cart`, { cart: state.cartItems })
        .then(response => {
          console.log('User cart updated:', response.data);
        })
        .catch(error => {
          console.error('Error updating user cart:', error);
        });
    }
  }, [state.cartItems, state.user]);
  
  const totalItems = useMemo(
    () => state.cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [state.cartItems]
  );

  return (
      <AppContext.Provider value={{ state, dispatch, totalItems }}>
        <RouterProvider router={router}/>
      </AppContext.Provider>
  );
}

export default App;