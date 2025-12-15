import axios from "axios";

const API = "http://localhost:5000/api/ai";

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
