"use client";

import UserPageFooter from "@/components/user-page/footer/Footer";
import UserPageHeader from "@/components/user-page/header/Header";
import Favorite from "@/components/user-page/profile-page/Favorite";
import Profile from "@/components/user-page/profile-page/Profile";
import Order from "./Order";

export default function UserProfilePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <UserPageHeader />

      {/* Main content */}
      <main className="flex-grow py-10 px-40">
        <Profile />
        <Order />
        <Favorite setCartItems={() => {}} setCartCount={() => {}} />
      </main>

      {/* Footer */}
      <UserPageFooter />
    </div>
  );
}
