import { createSlice } from "@reduxjs/toolkit";

// Helper function to safely parse JSON
const safeParseJSON = (item, fallback) => {
  try {
    return JSON.parse(item) || fallback;
  } catch (error) {
    return fallback;
  }
};

const initialState = {
  theme: safeParseJSON(window?.localStorage.getItem("theme"), "dark"),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
      localStorage.setItem("theme", JSON.stringify(action.payload));
    },
  },
});

export default themeSlice.reducer;

export function SetTheme(value) {
  return (dispatch) => {
    dispatch(themeSlice.actions.setTheme(value));
  };
}
