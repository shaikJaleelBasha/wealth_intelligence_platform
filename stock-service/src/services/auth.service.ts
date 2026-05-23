import axios from "axios";

export const verifyTokenWithAuthService = async (token: string) => {
  try {
    const response = await axios.post(
      `${process.env.AUTH_SERVICE_URL}/api/auth/verify`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ FIX HERE
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error("Unauthorized");
  }
};