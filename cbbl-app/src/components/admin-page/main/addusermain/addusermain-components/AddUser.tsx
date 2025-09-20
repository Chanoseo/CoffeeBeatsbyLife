import { useState } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AddUserContent from "./AddUserContent"; // Make sure this path is correct
import Users from "./Users";

function AddUser() {
  const [showAddUser, setShowAddUser] = useState(false);

  const handleToggle = () => {
    setShowAddUser((prev) => !prev);
  };

  return (
    <section className="products-card">
      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-lg lg:text-xl xl:text-2xl">Manage User</h1>

        <button
          onClick={handleToggle}
          className="bg-[#3C604C] text-sm text-white px-4 py-2 rounded cursor-pointer hover:bg-[#2F4A3A] transition-colors duration-200 ease-linear w-fit text-nowrap lg:text-base flex items-center"
        >
          <span>Add User</span>
          <FontAwesomeIcon icon={faPlus} className="ml-2" />
        </button>
      </div>

      {/* Show AddUserContent when showAddUser is true */}
      {showAddUser && <AddUserContent onClose={handleToggle} />}
      <Users />
    </section>
  );
}

export default AddUser;
