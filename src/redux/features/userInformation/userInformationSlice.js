/* eslint-disable no-unused-vars */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	userInformation: {},
    value:0
};

const userInformationSlice = createSlice({
	name: 'userInfo',
	initialState,
	reducers: {
		userInformation: (state, action) => {
			state.userInformation = action.payload;
		},
        refetchUserInfoApi: (state, action) => {
            state.value += 1;
          },
	},
});

export const { userInformation, refetchUserInfoApi } = userInformationSlice.actions;
export default userInformationSlice.reducer;
