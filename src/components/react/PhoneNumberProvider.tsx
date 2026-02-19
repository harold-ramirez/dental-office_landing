import { useEffect, useState } from "react";

export function usePhoneNumber() {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const apiUrl = import.meta.env.PUBLIC_API_URL;
        if (apiUrl) {
          const response = await fetch(
            `${apiUrl}/appointment-requests/doctor-phoneNumber`,
          );
          if (response.ok) {
            const text = await response.text();
            if (text) setPhoneNumber(text);
          }
        }
      } catch (error) {
        console.error("Failed to fetch phone number", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhoneNumber();
  }, []);

  return { phoneNumber, isLoading };
}
