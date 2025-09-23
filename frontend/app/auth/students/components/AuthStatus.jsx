export const AuthStatus = ({ message, type = "info" }) => {
  const styles = {
    info: "bg-blue-50 text-blue-700",
    success: "bg-green-50 text-green-700",
    loading: "bg-gray-50 text-gray-700"
  };

  return (
    <div className={`p-4 rounded-lg ${styles[type]}`}>
      {type === "loading" && (
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
          <span>{message}</span>
        </div>
      )}
      {type !== "loading" && message}
    </div>
  );
};