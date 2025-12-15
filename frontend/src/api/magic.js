import axios from "axios";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/ai`;

export const magicScanReceipt = async (token, imageBase64, mimeType) => {
  return axios.post(
    `${API}/magic`,
    { imageBase64, mimeType },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
