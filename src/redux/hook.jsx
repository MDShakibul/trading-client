

import { useDispatch, useSelector } from 'react-redux';

// Define a custom Redux hook for dispatching actions
export function useAppDispatch() {
  const dispatch = useDispatch();
  return dispatch;
}

// Define a custom Redux hook for selecting data from the store
export function useAppSelector(selector) {
  return useSelector(selector);
}