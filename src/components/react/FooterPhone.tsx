import { usePhoneNumber } from "./PhoneNumberProvider";
import PhoneIcon from "@icons/Phone.astro";

export function FooterPhone() {
  const { phoneNumber, isLoading } = usePhoneNumber();

  if (isLoading) {
    return (
      <p className="flex items-center gap-2 text-gray-500 cursor-not-allowed">
        <PhoneIcon className="w-5 h-5 text-blue-400 shrink-0" />
        <span>Cargando...</span>
      </p>
    );
  }

  if (!phoneNumber) {
    return (
      <p className="flex items-center gap-2 text-gray-500 cursor-not-allowed">
        <PhoneIcon className="w-5 h-5 text-blue-400 shrink-0" />
        <span>No disponible</span>
      </p>
    );
  }

  return (
    <p className="flex items-center gap-2">
      <PhoneIcon className="w-5 h-5 text-blue-400 shrink-0" />
      <a
        href={`tel:+591${phoneNumber}`}
        className="hover:text-blue-400 transition-colors"
      >
        +591 {phoneNumber}
      </a>
    </p>
  );
}
