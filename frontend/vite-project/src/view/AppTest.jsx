import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";

export default function TestApp() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>Home Page</div>
  );
}
