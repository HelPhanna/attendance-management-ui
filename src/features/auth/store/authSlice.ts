import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  loginForm: {
    usernameOrEmail: string;
    password: string;
    rememberMe: boolean;
  };
  registerForm: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptedTerms: boolean;
  };
  forgotPasswordForm: {
    email: string;
  };
};

const initialState: AuthState = {
  loginForm: {
    usernameOrEmail: "",
    password: "",
    rememberMe: false,
  },
  registerForm: {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptedTerms: false,
  },
  forgotPasswordForm: {
    email: "",
  },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoginField: (
      state,
      action: PayloadAction<{
        field: keyof AuthState["loginForm"];
        value: string | boolean;
      }>,
    ) => {
      const { field, value } = action.payload;
      state.loginForm[field] = value as never;
    },
    setRegisterField: (
      state,
      action: PayloadAction<{
        field: keyof AuthState["registerForm"];
        value: string | boolean;
      }>,
    ) => {
      const { field, value } = action.payload;
      state.registerForm[field] = value as never;
    },
    setForgotPasswordEmail: (state, action: PayloadAction<string>) => {
      state.forgotPasswordForm.email = action.payload;
    },
    resetLoginForm: (state) => {
      state.loginForm = initialState.loginForm;
    },
    resetRegisterForm: (state) => {
      state.registerForm = initialState.registerForm;
    },
    resetForgotPasswordForm: (state) => {
      state.forgotPasswordForm = initialState.forgotPasswordForm;
    },
  },
});

export const {
  setLoginField,
  setRegisterField,
  setForgotPasswordEmail,
  resetLoginForm,
  resetRegisterForm,
  resetForgotPasswordForm,
} = authSlice.actions;

export default authSlice.reducer;
