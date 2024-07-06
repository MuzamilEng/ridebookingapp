import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const storeApi = createApi({
  reducerPath: "storeApi",
  baseQuery: fetchBaseQuery({ baseUrl: `http://192.168.1.102:3000/api/v1` }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (data) => ({
        url: "/registerUser",
        method: "POST",
        body: data,
      }),
    }),
    loginUser: builder.mutation({
      query: (data) => ({
        url: "/login",
        method: "POST",
        body: data,
      }),
    }),
    getAllUsers: builder.mutation({
      query: (data) => ({
        url: "/getUsers",
        method: "POST",
        body: data,
      }),
    }),
    getUserLocation: builder.mutation({
      query: (data) => ({
        url: "/getUserLocation",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useGetAllUsersMutation,
  useGetUserLocationMutation,
  useLoginUserMutation,
} = storeApi;
