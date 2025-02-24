import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user_id: typeof window !== "undefined" ? localStorage.getItem("user_id") || "" : "",
  access_token: typeof window !== "undefined" ? localStorage.getItem("access_token") || "" : "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    register: (state, action) => {
      const { user_id, access_token } = action.payload;
      state.user_id = user_id;
      state.access_token = access_token;
      
      // Store in localStorage
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("access_token", access_token);
    },

    login: (state, action) => {
      const { user_id, access_token } = action.payload;
      state.user_id = user_id;
      state.access_token = access_token;
      
      // Store in localStorage
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("access_token", access_token);
    },
    
    logout: (state) => {
      state.user_id = "";
      state.access_token = "";

      // Remove from localStorage
      localStorage.removeItem("user_id");
      localStorage.removeItem("access_token");
    }
  },
});

export const { register, login, logout } = authSlice.actions;
export default authSlice.reducer;
