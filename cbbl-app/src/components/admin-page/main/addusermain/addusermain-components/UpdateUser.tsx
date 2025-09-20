import { faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UpdateUserForm from "./UpdateUserForm";

interface UpdateUserProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
  onClose: () => void;
  onDelete?: () => void; // Optional callback after deletion
}

export default function UpdateUser({
  user,
  onClose,
  onDelete,
}: UpdateUserProps) {
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;

    try {
      const res = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");

      alert(data.message);
      onDelete?.(); // Call parent callback to refresh the list
      onClose(); // Close the modal
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("An unexpected error occurred.");
    }
  };

  return (
    <div className="fixed left-0 top-0 w-full h-full z-50 flex justify-end bg-black/10">
      <div className="w-full md:w-1/3 bg-white p-6 shadow-lg overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl">Update User</h2>
          <div>
            <FontAwesomeIcon
              icon={faTrash}
              className="text-xl mr-4 cursor-pointer hover:text-red-600"
              onClick={handleDelete}
            />
            <FontAwesomeIcon
              icon={faX}
              onClick={onClose}
              className="text-xl cursor-pointer"
            />
          </div>
        </div>
        <UpdateUserForm user={user} />
      </div>
    </div>
  );
}
