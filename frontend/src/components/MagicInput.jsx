import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { magicScanReceipt } from "../api/magic";

export default function MagicInput({ onResult }) {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleFile = (file) => {
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result.split(",")[1];
        const res = await magicScanReceipt(token, base64, file.type);
        onResult(res.data);
      } catch (err) {
        console.error("Magic input failed:", err);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="border border-dashed rounded-xl p-4 text-center">
      <p className="text-sm">📸 Upload receipt</p>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFile(e.target.files[0])}
        disabled={loading}
      />

      {loading && (
        <p className="text-xs opacity-60 mt-2">
          Scanning receipt…
        </p>
      )}
    </div>
  );
}
