export default function DeleteSlotPopup({
  confirmDelete,
  cancelDelete,
}: {
  confirmDelete: () => void;
  cancelDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">
          Remove Availability Slot?
        </h3>
        <p className="mb-6">
          Are you sure you want to remove this availability slot?
        </p>
        <div className="flex gap-3">
          <button
            onClick={confirmDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Remove
          </button>
          <button
            onClick={cancelDelete}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
